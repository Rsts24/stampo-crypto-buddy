-- Public storage for shop logos (max 2 MB, images only).
-- Logos are uploaded during the setup form, before the vendor's account exists,
-- so uploads are allowed into the "uploads/" folder for everyone.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-logos', 'shop-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload a shop logo" on storage.objects;
create policy "Anyone can upload a shop logo" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'shop-logos' and (storage.foldername(name))[1] = 'uploads');
