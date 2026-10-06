create table if not exists public.bastide_encounters (
  id text primary key, name text not null, kind text not null default 'PNJ',
  summary text not null default '', player_text text not null default '',
  mj_notes text not null default '', image_url text not null default '',
  player_visible boolean not null default false, sort_order integer not null default 100,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.bastide_encounters enable row level security;
revoke all on public.bastide_encounters from anon, authenticated;
grant all on public.bastide_encounters to service_role;
create index if not exists bastide_encounters_visible_order_idx on public.bastide_encounters (player_visible, sort_order, name);
insert into public.bastide_encounters (id,name,kind,summary,player_text,mj_notes,player_visible,sort_order) values
('runara','Runara','PNJ','La dirigeante du Repos du Dragon.','Calme et accueillante, Runara veille sur le sanctuaire et sur celles et ceux qui y trouvent refuge.','Compléter ici les informations réservées au MJ. Ne jamais révéler sa véritable nature avant le moment voulu.',true,10),
('kobolds-repos-dragon','Les kobolds du Repos du Dragon','Groupe','Les habitants hauts en couleur du sanctuaire.','Le groupe a rencontré les kobolds qui vivent et travaillent au Repos du Dragon. Chacun possède son caractère, ses habitudes et son rôle dans la communauté.','Ajouter ici les noms, tempéraments et secrets au fur et à mesure de la campagne.',true,20)
on conflict (id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bastide-encounters','bastide-encounters',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
