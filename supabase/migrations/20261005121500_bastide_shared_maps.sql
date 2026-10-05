create table if not exists public.bastide_maps (
  id text primary key,
  title text not null,
  description text not null default '',
  image_url text not null,
  player_visible boolean not null default false,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

alter table public.bastide_maps enable row level security;

insert into public.bastide_maps (id,title,description,image_url,player_visible,sort_order)
values ('ile-runara','Carte de l’île confiée par Runara','Carte générale remise au groupe par Runara.','../assets/cartes/ile-runara-joueurs.png',true,10)
on conflict (id) do update set
  title=excluded.title,
  description=excluded.description,
  image_url=excluded.image_url,
  sort_order=excluded.sort_order,
  updated_at=now();

revoke all on table public.bastide_maps from anon, authenticated;
