create extension if not exists pgcrypto;

create table if not exists public.bastide_players (
  id text primary key,
  display_name text not null,
  token_hash text not null unique,
  state jsonb not null default '{"silver":0,"inventory":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint bastide_state_object check (jsonb_typeof(state) = 'object')
);

create table if not exists public.bastide_admin_tokens (
  token_hash text primary key,
  label text not null,
  revoked_at timestamptz
);

create table if not exists public.bastide_shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base text not null default '',
  category text not null default 'Équipement',
  description text not null default '',
  price_silver integer not null check (price_silver >= 0),
  stock integer check (stock is null or stock >= 0),
  charges_max integer not null default 0 check (charges_max >= 0),
  active boolean not null default true,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.bastide_inventory_events (
  id bigint generated always as identity primary key,
  player_id text not null references public.bastide_players(id) on delete cascade,
  event_type text not null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.bastide_players enable row level security;
alter table public.bastide_admin_tokens enable row level security;
alter table public.bastide_shop_items enable row level security;
alter table public.bastide_inventory_events enable row level security;
revoke all on public.bastide_players, public.bastide_admin_tokens, public.bastide_shop_items, public.bastide_inventory_events from anon, authenticated;
revoke all on sequence public.bastide_inventory_events_id_seq from anon, authenticated;

insert into public.bastide_players(id,display_name,token_hash) values
('prepotante','Prépôtante','3d5b174db6ee05bbab47e895add78d98ef7bbdf46a45ca3d6fd715ac38d60016'),
('scanlan','Scanlan','f5665b062d758a9e59892adb52652e9a2a21b5a732d914a7ee49fa82e3d2abab'),
('wilfried','Wilfried','8630a3dad49afa0031e05c53ba11b4135966bb82304bcc2f8b876aa60deae1df'),
('vivelame','Vivelame','8282a4afa3347385fc8915971acf7ef9c32b8500fbf84eadf421888e6db702c3'),
('zepheline','Zéphéline','e5fb970245a3550762bae7e868d8c14b16360efa48036562a4dd71ddc691111c')
on conflict (id) do update set display_name=excluded.display_name, token_hash=excluded.token_hash;
insert into public.bastide_admin_tokens(token_hash,label) values
('b5c5418eee44c22bdb46d097f8222e67ccd5df982ce1698ef71df91ba4e4d53e','MJ Bastide')
on conflict do nothing;

insert into public.bastide_shop_items(name,base,category,description,price_silver,stock,sort_order) values
('Rations de voyage','Rations','Consommable','Une journée de nourriture sèche.',5,null,10),
('Torche','Torche','Équipement','Éclaire les lieux sombres.',1,null,20),
('Corde de chanvre (10 m)','Corde','Équipement','Dix mètres de corde solide.',10,null,30),
('Potion de soins','Potion de soins','Consommable','Récupère des PV selon la règle validée par le MJ.',50,6,40)
on conflict do nothing;

create or replace function public.bastide_purchase(p_player_id text, p_item_id uuid, p_quantity integer)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_player public.bastide_players%rowtype; v_item public.bastide_shop_items%rowtype; v_cost integer; v_inventory jsonb; v_new jsonb;
begin
  if p_quantity < 1 or p_quantity > 20 then raise exception 'Quantité invalide'; end if;
  select * into v_player from public.bastide_players where id=p_player_id for update;
  select * into v_item from public.bastide_shop_items where id=p_item_id and active for update;
  if not found then raise exception 'Objet indisponible'; end if;
  if v_item.stock is not null and v_item.stock < p_quantity then raise exception 'Stock insuffisant'; end if;
  v_cost := v_item.price_silver * p_quantity;
  if coalesce((v_player.state->>'silver')::integer,0) < v_cost then raise exception 'Monnaie insuffisante'; end if;
  v_inventory := coalesce(v_player.state->'inventory','[]'::jsonb);
  v_new := jsonb_build_object('id','mila-'||gen_random_uuid(),'name',v_item.name,'base',v_item.base,'category',v_item.category,'quantity',p_quantity,'equipped',false,'chargesMax',v_item.charges_max,'charges',v_item.charges_max,'notes',v_item.description);
  update public.bastide_players set state=jsonb_set(jsonb_set(state,'{silver}',to_jsonb(((state->>'silver')::integer)-v_cost)),'{inventory}',v_inventory||jsonb_build_array(v_new)),updated_at=now() where id=p_player_id returning * into v_player;
  if v_item.stock is not null then update public.bastide_shop_items set stock=stock-p_quantity,updated_at=now() where id=p_item_id; end if;
  insert into public.bastide_inventory_events(player_id,event_type,summary,details) values(p_player_id,'purchase','Achat chez Mila : '||v_item.name,jsonb_build_object('quantity',p_quantity,'cost',v_cost));
  return v_player.state;
end $$;
revoke all on function public.bastide_purchase(text,uuid,integer) from public, anon, authenticated;
grant execute on function public.bastide_purchase(text,uuid,integer) to service_role;
