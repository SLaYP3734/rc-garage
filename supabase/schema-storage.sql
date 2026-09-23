-- RC Garage — Gerçek fotoğraf yükleme (Supabase Storage)
-- SQL Editor -> New query -> tamamını yapıştır, Run.

-- Fotoğrafların saklanacağı "depo" (bucket). public=true, yani
-- yüklenen fotoğraflar herkes tarafından görüntülenebilir (siteye
-- konan her fotoğraf zaten public bir paylaşım).
insert into storage.buckets (id, name, public)
values ('rc-garage-images', 'rc-garage-images', true)
on conflict (id) do nothing;

-- Herkes fotoğrafları görebilir.
drop policy if exists "rc_garage_images_public_read" on storage.objects;
create policy "rc_garage_images_public_read" on storage.objects
  for select using (bucket_id = 'rc-garage-images');

-- Sadece giriş yapmış kullanıcılar fotoğraf yükleyebilir.
drop policy if exists "rc_garage_images_auth_upload" on storage.objects;
create policy "rc_garage_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'rc-garage-images' and auth.role() = 'authenticated');

-- Kullanıcı sadece kendi yüklediği fotoğrafı silebilir.
drop policy if exists "rc_garage_images_owner_delete" on storage.objects;
create policy "rc_garage_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'rc-garage-images' and auth.uid() = owner);
