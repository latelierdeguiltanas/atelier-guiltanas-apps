import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-campaign-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const cleanToken = (req: Request) =>
  (req.headers.get("x-campaign-token") ?? "").trim();

async function hashToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireAdmin(req: Request) {
  const token = cleanToken(req);
  if (token.length < 32) return null;
  const tokenHash = await hashToken(token);
  const { data } = await db
    .from("campaign_admin_tokens")
    .select("id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();
  return data;
}

async function requirePlayer(req: Request, playerId: string) {
  const token = cleanToken(req);
  if (token.length < 32) return null;
  const tokenHash = await hashToken(token);
  const { data } = await db
    .from("campaign_player_tokens")
    .select("id, player_id")
    .eq("token_hash", tokenHash)
    .eq("player_id", playerId)
    .is("revoked_at", null)
    .maybeSingle();
  if (data) {
    await db.from("campaign_player_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);
  }
  return data;
}

async function signedImageUrl(path: string | null) {
  if (!path) return null;
  const { data } = await db.storage
    .from("campaign-handouts")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

async function decorateHandouts(handouts: Array<Record<string, unknown>>) {
  return await Promise.all(handouts.map(async (handout) => ({
    ...handout,
    image_url: await signedImageUrl(handout.storage_path as string | null),
    storage_path: undefined,
  })));
}

async function dashboard() {
  const [{ data: players, error: playersError }, { data: handouts, error: handoutsError }, { data: assignments, error: assignmentsError }] = await Promise.all([
    db.from("campaign_players").select("id, display_name, sort_order").order("sort_order"),
    db.from("campaign_handouts").select("id, kind, title, content_text, storage_path, mime_type, file_size, created_at, updated_at").order("created_at", { ascending: false }),
    db.from("campaign_handout_assignments").select("handout_id, player_id, assigned_at, revoked_at").order("assigned_at", { ascending: false }),
  ]);
  const error = playersError ?? handoutsError ?? assignmentsError;
  if (error) throw error;
  return {
    players: players ?? [],
    handouts: await decorateHandouts((handouts ?? []) as Array<Record<string, unknown>>),
    assignments: assignments ?? [],
  };
}

async function listForPlayer(playerId: string) {
  const { data, error } = await db
    .from("campaign_handout_assignments")
    .select("assigned_at, campaign_handouts(id, kind, title, content_text, storage_path, mime_type, file_size, created_at)")
    .eq("player_id", playerId)
    .is("revoked_at", null)
    .order("assigned_at", { ascending: false });
  if (error) throw error;
  const handouts = (data ?? []).flatMap((row) => {
    const handout = row.campaign_handouts as unknown as Record<string, unknown> | null;
    return handout ? [{ ...handout, assigned_at: row.assigned_at }] : [];
  });
  return await decorateHandouts(handouts);
}

function normalizedRecipients(value: unknown) {
  const allowed = new Set(["vax", "hammerz", "lelio", "loris"]);
  const values = Array.isArray(value) ? value : [];
  return [...new Set(values.filter((id): id is string => typeof id === "string" && allowed.has(id)))];
}

async function assignHandout(handoutId: string, recipients: string[]) {
  if (!recipients.length) return;
  const rows = recipients.map((playerId) => ({
    handout_id: handoutId,
    player_id: playerId,
    assigned_at: new Date().toISOString(),
    revoked_at: null,
  }));
  const { error } = await db.from("campaign_handout_assignments")
    .upsert(rows, { onConflict: "handout_id,player_id" });
  if (error) throw error;
  await db.from("campaign_handout_events").insert(recipients.map((playerId) => ({
    event_type: "assigned",
    handout_id: handoutId,
    player_id: playerId,
  })));
}

async function createTextHandout(payload: Record<string, unknown>) {
  const kind = payload.kind === "object" ? "object" : "text";
  const title = String(payload.title ?? "").trim().slice(0, 120);
  const contentText = String(payload.content_text ?? "").trim().slice(0, 20000);
  const recipients = normalizedRecipients(payload.recipients);
  if (!title || !contentText) throw new Error("Le titre et le contenu sont obligatoires.");
  const { data, error } = await db.from("campaign_handouts").insert({
    kind,
    title,
    content_text: contentText,
  }).select("id").single();
  if (error) throw error;
  await db.from("campaign_handout_events").insert({ event_type: "created", handout_id: data.id });
  await assignHandout(data.id, recipients);
  return data.id as string;
}

function safeFilename(filename: string) {
  const ext = filename.toLowerCase().match(/\.(png|jpe?g|webp|gif)$/)?.[0] ?? ".jpg";
  return `illustration${ext === ".jpeg" ? ".jpg" : ext}`;
}

async function createImageHandout(form: FormData) {
  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const file = form.get("file");
  let recipients: unknown = [];
  try { recipients = JSON.parse(String(form.get("recipients") ?? "[]")); } catch { /* invalid input becomes empty */ }
  const playerIds = normalizedRecipients(recipients);
  if (!title || !(file instanceof File) || !file.size) throw new Error("Le titre et l’image sont obligatoires.");
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error("Format d’image non accepté.");
  if (file.size > 15 * 1024 * 1024) throw new Error("L’image dépasse la limite de 15 Mo.");

  const id = crypto.randomUUID();
  const storagePath = `${id}/${safeFilename(file.name)}`;
  const { error: uploadError } = await db.storage.from("campaign-handouts").upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });
  if (uploadError) throw uploadError;
  const { error } = await db.from("campaign_handouts").insert({
    id,
    kind: "image",
    title,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  });
  if (error) {
    await db.storage.from("campaign-handouts").remove([storagePath]);
    throw error;
  }
  await db.from("campaign_handout_events").insert({ event_type: "created", handout_id: id });
  await assignHandout(id, playerIds);
  return id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "";
  try {
    if (req.method === "GET" && action === "list") {
      const playerId = url.searchParams.get("player") ?? "";
      if (!await requirePlayer(req, playerId)) return json({ error: "Lien joueur invalide ou expiré." }, 401);
      return json({ handouts: await listForPlayer(playerId) });
    }

    if (!await requireAdmin(req)) return json({ error: "Clé MJ invalide ou expirée." }, 401);

    if (req.method === "GET" && action === "dashboard") return json(await dashboard());
    if (req.method !== "POST") return json({ error: "Action inconnue." }, 404);
    if (action === "verify") return json({ ok: true });

    if (action === "create") {
      const contentType = req.headers.get("content-type") ?? "";
      const id = contentType.includes("multipart/form-data")
        ? await createImageHandout(await req.formData())
        : await createTextHandout(await req.json());
      return json({ ok: true, id }, 201);
    }

    const payload = await req.json() as Record<string, unknown>;
    if (action === "assign") {
      const handoutId = String(payload.handout_id ?? "");
      const recipients = normalizedRecipients(payload.recipients);
      if (!handoutId || !recipients.length) throw new Error("Attribution incomplète.");
      await assignHandout(handoutId, recipients);
      return json({ ok: true });
    }
    if (action === "revoke") {
      const handoutId = String(payload.handout_id ?? "");
      const playerId = String(payload.player_id ?? "");
      const { error } = await db.from("campaign_handout_assignments")
        .update({ revoked_at: new Date().toISOString() })
        .eq("handout_id", handoutId)
        .eq("player_id", playerId)
        .is("revoked_at", null);
      if (error) throw error;
      await db.from("campaign_handout_events").insert({ event_type: "revoked", handout_id: handoutId, player_id: playerId });
      return json({ ok: true });
    }
    if (action === "delete") {
      const handoutId = String(payload.handout_id ?? "");
      const { data: handout, error: findError } = await db.from("campaign_handouts")
        .select("storage_path")
        .eq("id", handoutId)
        .maybeSingle();
      if (findError) throw findError;
      if (handout?.storage_path) {
        const { error: storageError } = await db.storage.from("campaign-handouts").remove([handout.storage_path]);
        if (storageError) throw storageError;
      }
      const { error } = await db.from("campaign_handouts").delete().eq("id", handoutId);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "reset-player-link") {
      const playerId = String(payload.player_id ?? "");
      if (!normalizedRecipients([playerId]).length) throw new Error("Joueur inconnu.");
      const rawToken = randomToken();
      const tokenHash = await hashToken(rawToken);
      await db.from("campaign_player_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("player_id", playerId)
        .is("revoked_at", null);
      const { error } = await db.from("campaign_player_tokens").insert({ player_id: playerId, token_hash: tokenHash });
      if (error) throw error;
      await db.from("campaign_handout_events").insert({ event_type: "player_link_reset", player_id: playerId });
      return json({ ok: true, player_id: playerId, token: rawToken });
    }
    return json({ error: "Action inconnue." }, 404);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return json({ error: message }, 400);
  }
});
