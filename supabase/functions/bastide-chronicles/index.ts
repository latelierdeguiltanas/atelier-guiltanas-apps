import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-bastide-chronicle-token, x-bastide-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const db = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}

async function requireAdmin(req: Request) {
  const key=(req.headers.get("x-bastide-key")??"").replace(/ /g,"+").trim();
  if(!key)return false;
  const {data,error}=await db.from("bastide_admin_tokens").select("token_hash").eq("token_hash",await digest(key)).is("revoked_at",null).maybeSingle();
  if(error)throw error;
  return !!data;
}

async function requireEditor(req: Request) {
  const token = (req.headers.get("x-bastide-chronicle-token") ?? "").trim();
  if (token.length < 32) return null;
  const { data } = await db.from("bastide_chronicle_tokens")
    .select("id")
    .eq("token_hash", await digest(token))
    .is("revoked_at", null)
    .maybeSingle();
  if (data) await db.from("bastide_chronicle_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data;
}

async function signed(path: string) {
  const { data } = await db.storage.from("bastide-chronicles").createSignedUrl(path, 7200);
  return data?.signedUrl ?? null;
}

async function decorate(rows: Array<Record<string, unknown>>) {
  return await Promise.all(rows.map(async row => {
    const assets = Array.isArray(row.bastide_chronicle_assets) ? row.bastide_chronicle_assets : [];
    return {
      ...row,
      bastide_chronicle_assets: await Promise.all((assets as Array<Record<string, unknown>>).map(async asset => ({
        ...asset,
        url: await signed(String(asset.storage_path)),
        storage_path: undefined,
      }))),
    };
  }));
}

async function listChronicles(publicOnly: boolean, entryType = "") {
  let query = db.from("bastide_chronicles")
    .select("id, entry_type, character_id, session_number, session_date, title, subtitle, summary_text, lyrics_text, status, published_at, created_at, updated_at, bastide_chronicle_assets(id, kind, original_name, mime_type, file_size, caption, sort_order, storage_path, created_at)")
    .order("session_number", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (publicOnly) query = query.eq("status", "published");
  if (entryType) query = query.eq("entry_type", entryType);
  const { data, error } = await query;
  if (error) throw error;
  return await decorate((data ?? []) as Array<Record<string, unknown>>);
}

function cleanText(value: unknown, max: number) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

async function saveChronicle(payload: Record<string, unknown>) {
  const id = cleanText(payload.id, 80);
  const title = cleanText(payload.title, 120);
  if (!title) throw new Error("Le titre est obligatoire.");
  const rawSession = payload.session_number;
  const sessionNumber = rawSession === "" || rawSession == null ? null : Math.max(0, Math.min(999, Number(rawSession) || 0));
  const entryType = payload.entry_type === "hymn" ? "hymn" : "chronicle";
  const allowedCharacters = new Set(["prepotante", "scanlan", "wilfried", "vivelame", "zepheline", "faelar"]);
  const requestedCharacter = cleanText(payload.character_id, 40);
  const characterId = entryType === "hymn" && allowedCharacters.has(requestedCharacter) ? requestedCharacter : null;
  if (entryType === "hymn" && !characterId) throw new Error("Choisis le personnage de cet hymne.");
  const values = {
    entry_type: entryType,
    character_id: characterId,
    session_number: entryType === "chronicle" ? sessionNumber : null,
    session_date: /^\d{4}-\d{2}-\d{2}$/.test(String(payload.session_date ?? "")) ? payload.session_date : null,
    title,
    subtitle: cleanText(payload.subtitle, 220),
    summary_text: cleanText(payload.summary_text, 30000),
    lyrics_text: cleanText(payload.lyrics_text, 30000),
    updated_at: new Date().toISOString(),
  };
  if (id) {
    const { error } = await db.from("bastide_chronicles").update(values).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await db.from("bastide_chronicles").insert(values).select("id").single();
  if (error) throw error;
  return data.id as string;
}

function safeName(name: string, mime: string) {
  const extMap: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "audio/mpeg": ".mp3", "audio/mp4": ".m4a", "audio/ogg": ".ogg", "audio/wav": ".wav", "audio/x-wav": ".wav" };
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "media";
  return `${base}${extMap[mime] ?? ""}`;
}

async function uploadAsset(form: FormData) {
  const chronicleId = cleanText(form.get("chronicle_id"), 80);
  const kind = form.get("kind") === "audio" ? "audio" : "image";
  const caption = cleanText(form.get("caption"), 300);
  const file = form.get("file");
  if (!chronicleId || !(file instanceof File) || !file.size) throw new Error("Fichier incomplet.");
  const allowed = kind === "audio" ? /^audio\/(mpeg|mp4|ogg|wav|x-wav)$/ : /^image\/(jpeg|png|webp|gif)$/;
  if (!allowed.test(file.type)) throw new Error("Format de fichier non accepté.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Le fichier dépasse 50 Mo.");
  const assetId = crypto.randomUUID();
  const path = `${chronicleId}/${assetId}-${safeName(file.name, file.type)}`;
  const { error: uploadError } = await db.storage.from("bastide-chronicles").upload(path, file, { contentType: file.type, upsert: false, cacheControl: "3600" });
  if (uploadError) throw uploadError;
  const { error } = await db.from("bastide_chronicle_assets").insert({ id: assetId, chronicle_id: chronicleId, kind, storage_path: path, original_name: file.name.slice(0, 180), mime_type: file.type, file_size: file.size, caption });
  if (error) {
    await db.storage.from("bastide-chronicles").remove([path]);
    throw error;
  }
  return assetId;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const action = new URL(req.url).searchParams.get("action") ?? "";
  try {
    if (req.method === "GET" && action === "published") return json({ chronicles: await listChronicles(true, "chronicle") });
    if (req.method === "GET" && action === "published-hymns") return json({ hymns: await listChronicles(true, "hymn") });
    if (await requireAdmin(req)) {
      if(req.method==="GET"&&action==="dashboard")return json({chronicles:await listChronicles(false),access:"admin"});
      if(req.method==="POST"&&action==="verify")return json({ok:true,access:"admin"});
      return json({error:"Consultation MJ en lecture seule."},403);
    }
    if (!await requireEditor(req)) return json({ error: "Lien chroniqueur invalide ou expiré." }, 401);
    if (req.method === "GET" && action === "dashboard") return json({ chronicles: await listChronicles(false), access:"editor" });
    if (req.method !== "POST") return json({ error: "Action inconnue." }, 404);
    if (action === "verify") return json({ ok: true, access:"editor" });
    if (action === "save") return json({ ok: true, id: await saveChronicle(await req.json()) });
    if (action === "upload") return json({ ok: true, id: await uploadAsset(await req.formData()) }, 201);
    const payload = await req.json() as Record<string, unknown>;
    const id = cleanText(payload.id, 80);
    if (!id) throw new Error("Chronique inconnue.");
    if (action === "publish" || action === "unpublish") {
      const status = action === "publish" ? "published" : "draft";
      const { error } = await db.from("bastide_chronicles").update({ status, published_at: status === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "delete-asset") {
      const { data, error: findError } = await db.from("bastide_chronicle_assets").select("storage_path").eq("id", id).maybeSingle();
      if (findError) throw findError;
      if (data?.storage_path) await db.storage.from("bastide-chronicles").remove([data.storage_path]);
      const { error } = await db.from("bastide_chronicle_assets").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "delete") {
      const { data: assets } = await db.from("bastide_chronicle_assets").select("storage_path").eq("chronicle_id", id);
      const paths = (assets ?? []).map(x => x.storage_path);
      if (paths.length) await db.storage.from("bastide-chronicles").remove(paths);
      const { error } = await db.from("bastide_chronicles").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Action inconnue." }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Erreur serveur." }, 400);
  }
});
