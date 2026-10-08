-- Nespresso only. Existing campaign tokens remain the identity authority.
create table public.nespresso_inventories (
 player_id text primary key references public.campaign_players(id),
 initialized boolean not null default false,
 state jsonb not null default '{"money":{"PC":0,"PA":0,"PE":0,"PO":0,"PP":0},"inventory":[]}',
 revision bigint not null default 0, updated_at timestamptz not null default now()
);
create table public.nespresso_shop (
 id text primary key, name text not null, category text not null, description text not null default '',
 price_copper bigint not null check(price_copper>=0),stock integer check(stock>=0),
 active boolean not null default true,sort_order integer not null default 100
);
create table public.nespresso_events (
 id uuid primary key default gen_random_uuid(),player_id text not null references public.campaign_players(id),
 action text not null,summary text not null,details jsonb not null,created_at timestamptz not null default now(),seen_at timestamptz
);
create index on public.nespresso_events(player_id,created_at desc);
create table public.nespresso_requests (
 actor text not null,request_id uuid not null,payload jsonb not null,result jsonb not null,
 created_at timestamptz not null default now(),primary key(actor,request_id)
);
alter table public.nespresso_inventories enable row level security;
alter table public.nespresso_shop enable row level security;
alter table public.nespresso_events enable row level security;
alter table public.nespresso_requests enable row level security;
create policy "deny direct access" on public.nespresso_inventories for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_shop for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_events for all to anon,authenticated using(false) with check(false);
create policy "deny direct access" on public.nespresso_requests for all to anon,authenticated using(false) with check(false);
revoke all on public.nespresso_inventories,public.nespresso_shop,public.nespresso_events,public.nespresso_requests from public,anon,authenticated;
grant all on public.nespresso_inventories,public.nespresso_shop,public.nespresso_events,public.nespresso_requests to service_role;
insert into public.nespresso_inventories(player_id) select id from public.campaign_players where id in ('vax','hammerz','lelio','loris');

create or replace function public.nespresso_money(m jsonb) returns jsonb language plpgsql immutable set search_path=public as $$
declare k text; v numeric; r jsonb='{}';begin
 if jsonb_typeof(m)<>'object' then raise exception 'Monnaie invalide';end if;
 foreach k in array array['PC','PA','PE','PO','PP'] loop
 v=coalesce((m->>k)::numeric,0);if v<0 or v<>trunc(v) or v>100000000 then raise exception 'Montant invalide';end if;
 r=r||jsonb_build_object(k,v::bigint);end loop;return r;end;$$;
create or replace function public.nespresso_value(m jsonb) returns bigint language sql immutable set search_path=public as $$
 select (m->>'PC')::bigint+10*(m->>'PA')::bigint+50*(m->>'PE')::bigint+100*(m->>'PO')::bigint+1000*(m->>'PP')::bigint;$$;
create or replace function public.nespresso_change(v bigint) returns jsonb language sql immutable set search_path=public as $$
 select jsonb_build_object('PP',v/1000,'PO',(v%1000)/100,'PE',0,'PA',(v%100)/10,'PC',v%10);$$;
create or replace function public.nespresso_item(x jsonb) returns jsonb language plpgsql volatile set search_path=public as $$
declare q numeric; c numeric; mx numeric;begin
 q=coalesce((x->>'qty')::numeric,1);c=coalesce((x->>'charges')::numeric,0);mx=coalesce((x->>'chargesMax')::numeric,0);
 if q<1 or q<>trunc(q) or q>100000 or c<0 or mx<0 or c>mx or mx>100000 or c<>trunc(c) or mx<>trunc(mx) or length(trim(coalesce(x->>'name','')))=0 then raise exception 'Objet ou quantité invalide';end if;
 return jsonb_build_object('id',coalesce(nullif(x->>'id',''),gen_random_uuid()::text),'name',left(x->>'name',120),'qty',q::bigint,'weight',greatest(0,coalesce((x->>'weight')::numeric,0)),'category',left(coalesce(x->>'category','Équipement'),60),'notes',left(coalesce(x->>'notes',''),6000),'charges',c::bigint,'chargesMax',mx::bigint,'equipped',coalesce((x->>'equipped')::boolean,false),'containerId',left(coalesce(x->>'containerId',''),160),'shopItemId',left(coalesce(x->>'shopItemId',''),80),'mediaUrl',left(coalesce(x->>'mediaUrl',''),1000));end;$$;

-- Invoker, service_role only; edge verifies campaign tokens before passing actor/admin.
-- A dedicated advisory lock serializes the small Nespresso economy, never Bastide.
create or replace function public.nespresso_mutate(p_actor text,p_admin boolean,p_action text,p_body jsonb,p_request uuid) returns jsonb
language plpgsql set search_path=public as $$
declare target text; recipient text; a public.nespresso_inventories; b public.nespresso_inventories;
 s jsonb; t jsonb; inv jsonb; item jsonb; old jsonb; m jsonb; n jsonb; k text; q bigint; total bigint=0; offer bigint; line jsonb;
 product public.nespresso_shop; r jsonb; cached public.nespresso_requests; payload jsonb; summary text; idx integer;
begin
 perform pg_advisory_xact_lock(642831987102);
 if p_request is null then raise exception 'Identifiant de transaction requis';end if;
 payload=jsonb_build_object('action',p_action,'body',p_body,'admin',p_admin);
 select * into cached from public.nespresso_requests where actor=p_actor and request_id=p_request;
 if found then if cached.payload<>payload then raise exception 'Identifiant déjà utilisé';end if;return cached.result;end if;
 if not p_admin and p_actor not in ('vax','hammerz','lelio','loris') then raise exception 'Accès joueur requis';end if;
 target=case when p_admin then p_body->>'playerId' else p_actor end;
 if p_action='shop-save' then
 if not p_admin then raise exception 'Accès MJ requis';end if;
 if trim(coalesce(p_body->>'name',''))='' then raise exception 'Nom requis';end if;
 if (p_body->>'price_copper')::numeric<>trunc((p_body->>'price_copper')::numeric) or (p_body->>'stock')::numeric<>trunc((p_body->>'stock')::numeric) then raise exception 'Prix et stock entiers requis';end if;
 insert into public.nespresso_shop(id,name,category,description,price_copper,stock,active)
 values(coalesce(nullif(p_body->>'id',''),gen_random_uuid()::text),left(p_body->>'name',120),left(coalesce(p_body->>'category','Équipement'),60),left(coalesce(p_body->>'description',''),6000),(p_body->>'price_copper')::bigint,(p_body->>'stock')::integer,coalesce((p_body->>'active')::boolean,true))
 on conflict(id) do update set name=excluded.name,category=excluded.category,description=excluded.description,price_copper=excluded.price_copper,stock=excluded.stock,active=excluded.active;
 r=jsonb_build_object('ok',true);
 else
 select * into a from public.nespresso_inventories where player_id=target for update;
 if not found then raise exception 'Destinataire Nespresso introuvable';end if;
 s=a.state;inv=s->'inventory';m=public.nespresso_money(s->'money');
 if p_action='bootstrap' then
 if p_admin then raise exception 'Import réservé au joueur';end if;
 if a.initialized then r=jsonb_build_object('state',s,'kept',true,'revision',a.revision);
 else
 if jsonb_typeof(p_body->'inventory')<>'array' or jsonb_array_length(p_body->'inventory')>250 then raise exception 'Inventaire invalide';end if;
 inv='[]';for item in select value from jsonb_array_elements(p_body->'inventory') loop inv=inv||jsonb_build_array(public.nespresso_item(item));end loop;
 if (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(inv)) then raise exception 'Identifiants objets dupliqués';end if;
 m=public.nespresso_money(p_body->'money');
 foreach k in array array['PC','PA','PE','PO','PP'] loop m=jsonb_set(m,array[k],to_jsonb((m->>k)::bigint+coalesce((s->'money'->>k)::bigint,0)));end loop;
 inv=inv||(s->'inventory');s=jsonb_build_object('inventory',inv,'money',m);
 update public.nespresso_inventories set state=s,initialized=true,revision=revision+1,updated_at=now() where player_id=target returning revision into a.revision;
 r=jsonb_build_object('state',s,'revision',a.revision);end if;
 elsif p_action='seen' then
 update public.nespresso_events set seen_at=now() where player_id=target and seen_at is null;r=jsonb_build_object('ok',true);
 else
 if not a.initialized and p_action<>'send' then raise exception 'Le joueur doit d’abord synchroniser son sac depuis son téléphone';end if;
 if p_action in ('item-save','item-delete') then
 if (p_body->>'revision')::bigint is distinct from a.revision then raise exception 'Inventaire actualisé ailleurs : recharge avant de modifier';end if;
 if p_action='item-save' then
 item=public.nespresso_item(p_body->'item');
 inv=coalesce((select jsonb_agg(value) from jsonb_array_elements(inv) where value->>'id'<>item->>'id'),'[]')||jsonb_build_array(item);
 else inv=coalesce((select jsonb_agg(value) from jsonb_array_elements(inv) where value->>'id'<>p_body->>'itemId'),'[]');end if;
 summary='Objet modifié';
 elsif p_action in ('transfer-money','transfer-item') then
 recipient=p_body->>'recipientId';if recipient=target then raise exception 'Choisis un autre personnage';end if;
 select * into b from public.nespresso_inventories where player_id=recipient for update;
 if not found then raise exception 'Destinataire Nespresso introuvable';end if;
 -- Unsynchronised recipients keep deliveries pending until their one-time local import.
 t=b.state;
 if p_action='transfer-money' then
 n=public.nespresso_money(p_body->'amount');if public.nespresso_value(n)<1 then raise exception 'Montant requis';end if;
 foreach k in array array['PC','PA','PE','PO','PP'] loop
 if (m->>k)::bigint<(n->>k)::bigint then raise exception 'Pas assez de pièces % : utilise le change',k;end if;
 m=jsonb_set(m,array[k],to_jsonb((m->>k)::bigint-(n->>k)::bigint));
 t=jsonb_set(t,array['money',k],to_jsonb(coalesce((t->'money'->>k)::bigint,0)+(n->>k)::bigint));end loop;summary='Transfert de monnaie';
 else
 if (p_body->>'quantity')::numeric<>trunc((p_body->>'quantity')::numeric) then raise exception 'Quantité entière requise';end if;
 q=(p_body->>'quantity')::bigint;if q is null or q<1 then raise exception 'Quantité requise';end if;
 select value into item from jsonb_array_elements(inv) where value->>'id'=p_body->>'itemId';
 if item is null or (item->>'qty')::bigint<q then raise exception 'Quantité indisponible';end if;
 if (item->>'equipped')::boolean then raise exception 'Déséquipe cet objet avant de le transférer';end if;
 if exists(select 1 from jsonb_array_elements(inv) where value->>'containerId'=item->>'id') then raise exception 'Vide le conteneur avant de le transférer';end if;
 inv=coalesce((select jsonb_agg(case when value->>'id'=item->>'id' then jsonb_set(value,'{qty}',to_jsonb((value->>'qty')::bigint-q)) else value end) from jsonb_array_elements(inv) where value->>'id'<>item->>'id' or (value->>'qty')::bigint>q),'[]');
 item=item||jsonb_build_object('id',gen_random_uuid()::text,'qty',q,'equipped',false,'containerId','');t=jsonb_set(t,'{inventory}',(t->'inventory')||jsonb_build_array(item));summary='Transfert : '||(item->>'name');end if;
 update public.nespresso_inventories set state=t,revision=revision+1,updated_at=now() where player_id=recipient;
 insert into public.nespresso_events(player_id,action,summary,details) values(recipient,p_action,summary,jsonb_build_object('sender',target,'requestId',p_request));
 elsif p_action='change' then m=public.nespresso_change(public.nespresso_value(m));summary='Change de monnaie';
 elsif p_action='purchase' then
 if jsonb_typeof(p_body->'lines')<>'array' or jsonb_array_length(p_body->'lines') not between 1 and 40 then raise exception 'Panier invalide';end if;
 for line in select value from jsonb_array_elements(p_body->'lines') loop
 if (line->>'quantity')::numeric<>trunc((line->>'quantity')::numeric) then raise exception 'Quantité entière requise';end if;
 q=(line->>'quantity')::bigint;if q is null or q<1 or q>1000 then raise exception 'Quantité invalide';end if;
 select * into product from public.nespresso_shop where id=line->>'itemId' and active for update;
 if not found then raise exception 'Article indisponible';end if;
 if product.stock is not null and product.stock<q then raise exception 'Stock insuffisant : %',product.name;end if;
 total=total+product.price_copper*q;
 item=public.nespresso_item(jsonb_build_object('name',product.name,'qty',q,'category',product.category,'notes',product.description,'shopItemId',product.id));inv=inv||jsonb_build_array(item);
 update public.nespresso_shop set stock=stock-q where id=product.id and stock is not null;end loop;
 if public.nespresso_value(m)<total then raise exception 'Monnaie insuffisante';end if;
 m=public.nespresso_change(public.nespresso_value(m)-total);summary='Achat chez Mila';
 elsif p_action='sell' then
 if jsonb_typeof(p_body->'lines')<>'array' or jsonb_array_length(p_body->'lines') not between 1 and 40 then raise exception 'Vente invalide';end if;
 for line in select value from jsonb_array_elements(p_body->'lines') loop
 if (line->>'quantity')::numeric<>trunc((line->>'quantity')::numeric) then raise exception 'Quantité entière requise';end if;
 q=(line->>'quantity')::bigint;if q is null or q<1 then raise exception 'Quantité invalide';end if;
 select value into item from jsonb_array_elements(inv) where value->>'id'=line->>'itemId';
 if item is null or (item->>'qty')::bigint<q or (item->>'equipped')::boolean then raise exception 'Objet indisponible ou équipé';end if;
 if exists(select 1 from jsonb_array_elements(inv) where value->>'containerId'=item->>'id') then raise exception 'Vide le conteneur avant de le vendre';end if;
 select * into product from public.nespresso_shop where active and (id=item->>'shopItemId' or lower(name)=lower(item->>'name')) order by (id=item->>'shopItemId') desc nulls last limit 1 for update;
 if not found then raise exception 'Estimation du MJ requise';end if;
 offer=product.price_copper/2;total=total+offer*q;
 inv=coalesce((select jsonb_agg(case when value->>'id'=item->>'id' then jsonb_set(value,'{qty}',to_jsonb((value->>'qty')::bigint-q)) else value end) from jsonb_array_elements(inv) where value->>'id'<>item->>'id' or (value->>'qty')::bigint>q),'[]');
 update public.nespresso_shop set stock=stock+q where id=product.id and stock is not null;end loop;
 m=public.nespresso_change(public.nespresso_value(m)+total);summary='Vente à Mila';
 elsif p_action='send' then
 if not p_admin then raise exception 'Accès MJ requis';end if;
 n=public.nespresso_money(coalesce(p_body->'money','{}'));
 foreach k in array array['PC','PA','PE','PO','PP'] loop m=jsonb_set(m,array[k],to_jsonb((m->>k)::bigint+(n->>k)::bigint));end loop;
 for item in select value from jsonb_array_elements(coalesce(p_body->'items','[]')) loop inv=inv||jsonb_build_array(public.nespresso_item(item||jsonb_build_object('id',gen_random_uuid()::text)));end loop;
 summary=left(coalesce(p_body->>'summary','Envoi du MJ'),200);
 else raise exception 'Action inconnue';end if;
 s=jsonb_build_object('inventory',inv,'money',public.nespresso_money(m));
 update public.nespresso_inventories set state=s,revision=revision+1,updated_at=now() where player_id=target returning revision into a.revision;
 insert into public.nespresso_events(player_id,action,summary,details) values(target,p_action,summary,p_body-'items'-'item');
 r=jsonb_build_object('state',s,'revision',a.revision,'ok',true);
 end if;end if;
 insert into public.nespresso_requests(actor,request_id,payload,result) values(p_actor,p_request,payload,r);return r;
end;$$;
revoke all on function public.nespresso_money(jsonb),public.nespresso_value(jsonb),public.nespresso_change(bigint),public.nespresso_item(jsonb),public.nespresso_mutate(text,boolean,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.nespresso_money(jsonb),public.nespresso_value(jsonb),public.nespresso_change(bigint),public.nespresso_item(jsonb),public.nespresso_mutate(text,boolean,text,jsonb,uuid) to service_role;

insert into public.nespresso_shop(id,name,category,description,price_copper,sort_order) values
('i0','Club','Arme','1d4 contondant • légère • Slow
Arme : 1d4 contondant • légère • Slow.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',10,0),
('i1','Dague','Arme','1d4 perforant • finesse, légère, jet 6/18 m • Nick
Arme : 1d4 perforant • finesse, légère, jet 6/18 m • Nick.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',200,1),
('i2','Gourdin','Arme','1d8 contondant • deux mains • Push
Arme : 1d8 contondant • deux mains • Push.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',20,2),
('i3','Hachette','Arme','1d6 tranchant • légère, jet • Vex
Arme : 1d6 tranchant • légère, jet • Vex.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',500,3),
('i4','Javeline','Arme','1d6 perforant • jet 9/36 m • Slow
Arme : 1d6 perforant • jet 9/36 m • Slow.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',50,4),
('i5','Marteau léger','Arme','1d4 contondant • légère, jet • Nick
Arme : 1d4 contondant • légère, jet • Nick.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',200,5),
('i6','Masse','Arme','1d6 contondant • Sap
Arme : 1d6 contondant • Sap.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',500,6),
('i7','Bâton','Arme','1d6 contondant • polyvalent 1d8 • Topple
Arme : 1d6 contondant • polyvalent 1d8 • Topple.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',20,7),
('i8','Faucille','Arme','1d4 tranchant • légère • Nick
Arme : 1d4 tranchant • légère • Nick.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',100,8),
('i9','Lance','Arme','1d6 perforant • jet, polyvalent • Sap
Arme : 1d6 perforant • jet, polyvalent • Sap.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',100,9),
('i10','Arbalète légère','Arme','1d8 perforant • munitions, chargement, deux mains • Slow
Arme : 1d8 perforant • munitions, chargement, deux mains • Slow.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',2500,10),
('i11','Arc court','Arme','1d6 perforant • munitions, deux mains • Vex
Arme : 1d6 perforant • munitions, deux mains • Vex.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',2500,11),
('i12','Hache d’armes','Arme','1d8 tranchant • polyvalente • Topple
Arme : 1d8 tranchant • polyvalente • Topple.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',1000,12),
('i13','Fléau','Arme','1d8 contondant • Sap
Arme : 1d8 contondant • Sap.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',1000,13),
('i14','Coutille','Arme','1d10 tranchant • lourde, allonge, deux mains • Graze
Arme : 1d10 tranchant • lourde, allonge, deux mains • Graze.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',2000,14),
('i15','Hache à deux mains','Arme','1d12 tranchant • lourde, deux mains • Cleave
Arme : 1d12 tranchant • lourde, deux mains • Cleave.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',3000,15),
('i16','Épée à deux mains','Arme','2d6 tranchant • lourde, deux mains • Graze
Arme : 2d6 tranchant • lourde, deux mains • Graze.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',5000,16),
('i17','Hallebarde','Arme','1d10 tranchant • lourde, allonge, deux mains • Cleave
Arme : 1d10 tranchant • lourde, allonge, deux mains • Cleave.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',2000,17),
('i18','Lance d’arçon','Arme','1d10 perforant • lourde, allonge • Topple
Arme : 1d10 perforant • lourde, allonge • Topple.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',1000,18),
('i19','Épée longue','Arme','1d8 tranchant • polyvalente • Sap
Arme : 1d8 tranchant • polyvalente • Sap.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',1500,19),
('i20','Maillet','Arme','2d6 contondant • lourd, deux mains • Topple
Arme : 2d6 contondant • lourd, deux mains • Topple.
Action Attaque : fais une attaque avec l’arme si ton personnage peut la manier. Les propriétés et la maîtrise d’arme indiquées s’appliquent selon les règles 2024.',1000,20),
('i21','Armure matelassée','Armure','CA 11 + Dex • discrétion désavantage
Protection : CA 11 + Dex • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',500,21),
('i22','Armure de cuir','Armure','CA 11 + Dex
Protection : CA 11 + Dex.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',1000,22),
('i23','Cuir clouté','Armure','CA 12 + Dex
Protection : CA 12 + Dex.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',4500,23),
('i24','Armure de peau','Armure','CA 12 + Dex (max 2)
Protection : CA 12 + Dex (max 2).
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',1000,24),
('i25','Chemise de mailles','Armure','CA 13 + Dex (max 2)
Protection : CA 13 + Dex (max 2).
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',5000,25),
('i26','Armure d’écailles','Armure','CA 14 + Dex (max 2) • discrétion désavantage
Protection : CA 14 + Dex (max 2) • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',5000,26),
('i27','Cuirasse','Armure','CA 14 + Dex (max 2)
Protection : CA 14 + Dex (max 2).
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',40000,27),
('i28','Demi-plate','Armure','CA 15 + Dex (max 2) • discrétion désavantage
Protection : CA 15 + Dex (max 2) • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',75000,28),
('i29','Broigne','Armure','CA 14 • discrétion désavantage
Protection : CA 14 • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',3000,29),
('i30','Cotte de mailles','Armure','CA 16 • For 13 • discrétion désavantage
Protection : CA 16 • For 13 • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',7500,30),
('i31','Clibanion','Armure','CA 17 • For 15 • discrétion désavantage
Protection : CA 17 • For 15 • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',20000,31),
('i32','Harnois','Armure','CA 18 • For 15 • discrétion désavantage
Protection : CA 18 • For 15 • discrétion désavantage.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',150000,32),
('i33','Bouclier','Armure','+2 CA • nécessite entraînement bouclier
Protection : +2 CA • nécessite entraînement bouclier.
Équipe l’armure ou le bouclier si ton personnage possède l’entraînement requis. La CA indiquée remplace ou modifie ta CA selon le type d’équipement.',1000,33),
('i34','Acide','Aventurier','Jet à 6 m • 2d6 acide sur échec de sauvegarde Dex
Jet à 6 m • 2d6 acide sur échec de sauvegarde Dex.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',2500,34),
('i35','Feu grégeois','Aventurier','Jet à 6 m • enflamme la cible
Jet à 6 m • enflamme la cible.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',5000,35),
('i36','Antitoxine','Aventurier','Consommable contre le poison
Aide temporairement à résister au poison.
Action bonus : boire la fiole pour obtenir l’Avantage aux jets de sauvegarde visant à éviter ou terminer l’état Empoisonné pendant 1 heure.',5000,36),
('i37','Sac à dos','Aventurier','Contenant • 5 lb
Contenant • 5 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',200,37),
('i38','Billes','Aventurier','Contrôle de zone au sol
Créent une petite zone glissante pouvant faire tomber une créature.
Action Utiliser : répands-les au sol. Une créature entrant dans la zone peut devoir réussir un JS de Dextérité ou tomber À terre.',100,38),
('i39','Sac de couchage','Aventurier','7 lb
7 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',100,39),
('i40','Couverture','Aventurier','3 lb
3 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',50,40),
('i41','Chandelle','Aventurier','Éclairage
Éclairage.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',1,41),
('i42','Chaîne','Aventurier','10 lb • peut entraver une cible déjà contrôlée
10 lb • peut entraver une cible déjà contrôlée.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',500,42),
('i43','Nécessaire d’escalade','Aventurier','Permet de s’ancrer contre les chutes
Ensemble d’escalade permettant de s’ancrer et de limiter une chute.
Action Utiliser pour t’ancrer. Tant que tu es ancré, ta chute et ton déplacement depuis l’ancrage sont limités par les règles de l’objet.',2500,43),
('i44','Pied-de-biche','Aventurier','Avantage aux tests de Force où le levier s’applique
Outil de levier donnant l’Avantage aux tests de Force lorsque son levier peut réellement s’appliquer.
Utilise-le sur une porte, caisse ou obstacle adapté ; le MJ décide si le levier est pertinent.',200,44),
('i45','Paquetage d’explorateur','Aventurier','Sac, couchage, huile, 10 jours rations, corde, amadou, 10 torches, outre
Pack regroupant sac à dos, couchage, huile, 10 jours de rations, corde, amadou, 10 torches et outre.
Pas d’action spéciale : ouvre le détail des objets du paquet lorsque tu les utilises.',1000,45),
('i46','Grappin','Aventurier','S’utilise avec une corde
Crochet destiné à accrocher une rambarde, corniche ou autre prise, généralement avec une corde.
Action Utiliser : lancer vers une prise à portée ; un test de Dextérité (Acrobaties) peut être requis.',200,46),
('i47','Trousse de soins','Aventurier','10 utilisations • stabilise à 0 PV sans test de Médecine
10 utilisations. Permet de stabiliser une créature inconsciente à 0 PV sans test de Médecine.
Action Utiliser : dépense 1 utilisation sur une créature à portée de contact. Hammerz peut aussi en dépenser une avec son don Guérisseur/Médecin de bataille.',500,47),
('i48','Eau bénite','Aventurier','2d8 radiant contre fiélon ou mort-vivant sur échec de Dex
Consommable particulièrement utile contre certains fiélons et morts-vivants.
S’utilise selon la règle de l’objet pour asperger/lancer l’eau bénite sur une cible valide.',2500,48),
('i49','Piège de chasse','Aventurier','Piège physique
Piège physique.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',500,49),
('i50','Lampe','Aventurier','Éclairage
Éclairage.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',50,50),
('i51','Lanterne à capote','Aventurier','Éclairage réglable
Éclairage réglable.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',500,51),
('i52','Lanterne sourde','Aventurier','Faisceau directionnel
Faisceau directionnel.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',1000,52),
('i53','Menottes','Aventurier','6 lb
6 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',200,53),
('i54','Miroir','Aventurier','1/2 lb
1/2 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',500,54),
('i55','Filet','Aventurier','3 lb
3 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',100,55),
('i56','Huile','Aventurier','Combustible / usage tactique
Combustible et ressource tactique inflammable.
Peut alimenter une lampe ou être utilisée selon les règles de l’huile ; attention au feu et à l’environnement.',10,56),
('i57','Potion de soins','Aventurier','Objet magique commun vendu comme équipement 2024 • rend 2d4+2 PV
Potion magique. La créature qui la boit récupère 2d4 + 2 PV.
Action bonus pour la boire ou l’administrer à une autre créature à 1,50 m.',5000,57),
('i58','Rations (1 jour)','Aventurier','2 lb
Nourriture sèche prévue pour une journée de voyage.
Consommée pendant les pauses/voyages lorsque la nourriture est suivie.',50,58),
('i59','Corde','Aventurier','5 lb
Corde d’aventurier de 5 lb, utile pour escalade, arrimage, sauvetage et improvisation.
L’usage dépend de la situation : attacher, sécuriser ou combiner avec un grappin ; le MJ peut demander un test.',100,59),
('i60','Pelle','Aventurier','5 lb
5 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',200,60),
('i61','Sifflet','Aventurier','Signal
Signal.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',5,61),
('i62','Parchemin de sort (tour de magie)','Aventurier','Parchemin magique 2024
Parchemin magique 2024.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',3000,62),
('i63','Parchemin de sort (niveau 1)','Aventurier','Parchemin magique 2024
Parchemin magique 2024.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',5000,63),
('i64','Tente','Aventurier','20 lb
20 lb.
Utilise cet objet lorsque la situation correspond à son effet. Les actions, tests ou limites éventuels sont détaillés dans les règles D&D 2024.',200,64),
('i65','Boîte à amadou','Aventurier','Allumer un feu
Matériel permettant d’allumer facilement une flamme.
S’utilise pour allumer torche, feu ou autre combustible lorsque les conditions le permettent.',50,65),
('i66','Torche','Aventurier','Éclairage • 1 lb
Source de lumière portable qui se consume avec le temps.
Allume-la avec une source de feu ou une boîte à amadou ; elle occupe une main lorsqu’elle est portée.',1,66),
('i67','Outre','Aventurier','5 lb pleine
Récipient pour transporter de l’eau ; 5 lb lorsqu’elle est pleine.
Remplis-la à une source d’eau et utilise-la pendant les voyages ou repos.',20,67),
('i68','Matériel d’alchimiste','Outil','Artisanat : acide, feu grégeois, huile…
Artisanat : acide, feu grégeois, huile….
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',5000,68),
('i69','Matériel de brasseur','Outil','Détecter boisson empoisonnée • fabriquer antitoxine
Détecter boisson empoisonnée • fabriquer antitoxine.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',2000,69),
('i70','Matériel de calligraphe','Outil','Écriture • fabrication de parchemins
Écriture • fabrication de parchemins.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',1000,70),
('i71','Outils de charpentier','Outil','Travail du bois / objets simples
Travail du bois / objets simples.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',800,71),
('i72','Outils de cartographe','Outil','Tracer une carte
Tracer une carte.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',1500,72),
('i73','Outils de cordonnier','Outil','Modifier des chaussures / kit d’escalade
Modifier des chaussures / kit d’escalade.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',500,73),
('i74','Ustensiles de cuisinier','Outil','Cuisine • rations
Cuisine • rations.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',100,74),
('i75','Outils de souffleur de verre','Outil','Objets en verre
Objets en verre.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',3000,75),
('i76','Outils de joaillier','Outil','Évaluer gemmes • focaliseurs
Évaluer gemmes • focaliseurs.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',2500,76),
('i77','Outils de tanneur','Outil','Cuir, sacs, carquois…
Cuir, sacs, carquois….
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',500,77),
('i78','Outils de maçon','Outil','Travail de pierre
Travail de pierre.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',1000,78),
('i79','Trousse d’herboriste','Outil','Identifier plantes • fabriquer antitoxine, trousse de soins, potion de soins
Identifier plantes • fabriquer antitoxine, trousse de soins, potion de soins.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',500,79),
('i80','Outils de navigateur','Outil','Tracer une route / position aux étoiles
Tracer une route / position aux étoiles.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',2500,80),
('i81','Trousse d’empoisonneur','Outil','Détecter / fabriquer poison basique
Détecter / fabriquer poison basique.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',5000,81),
('i82','Outils de voleur','Outil','Crocheter serrure / désamorcer piège
Crocheter serrure / désamorcer piège.
Utilise cet outil pour les tâches ou fabrications correspondantes. La maîtrise de l’outil peut être nécessaire ; le MJ fixe les tests et le temps requis.',2500,82),
('i83','Flèches (20)','Aventurier','20 flèches • 1 lb • munitions pour arcs
Lot de 20 munitions pour les arcs. Une flèche est dépensée à chaque attaque.
Charge-les dans un carquois. Après un combat, le MJ peut appliquer la règle de récupération des munitions.',100,83),
('i84','Sacoche à composantes','Aventurier','Contient les composantes matérielles gratuites des sorts • 2 lb
Sacoche étanche compartimentée contenant les composantes matérielles gratuites nécessaires aux sorts.
Un lanceur de sorts peut l’utiliser pour fournir les composantes M sans coût indiqué. Elle ne remplace pas une composante ayant un prix spécifique.',2500,84),
('i85','Focaliseur arcanique — cristal','Aventurier','Focaliseur pour ensorceleur, occultiste ou magicien • 1 lb
Objet permettant à un ensorceleur, occultiste ou magicien de fournir les composantes matérielles gratuites de ses sorts.
Tiens/utilise le focaliseur lorsque le sort exige une composante M sans coût spécifique.',1000,85),
('i86','Focaliseur arcanique — bâton','Aventurier','Focaliseur arcanique ; peut aussi servir de bâton • 4 lb
Focaliseur arcanique qui peut aussi servir de bâton.
Utilise-le comme focaliseur pour les composantes M gratuites ; comme arme, applique les règles du bâton.',500,86);
