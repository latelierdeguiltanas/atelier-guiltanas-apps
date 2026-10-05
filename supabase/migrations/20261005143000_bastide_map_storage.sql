insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bastide-maps','bastide-maps',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public_read_bastide_maps" on storage.objects;
create policy "public_read_bastide_maps"
on storage.objects for select
to anon, authenticated
using (bucket_id='bastide-maps');
