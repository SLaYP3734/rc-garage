-- RC Atölyesi — Yönetici (Admin) Silme Yetkisi
-- ÖNEMLİ: Aşağıdaki 'ADMIN_UUID_BURAYA' yazan HER YERİ (4 tane), kendi
-- admin hesabının UUID'i ile değiştir (Vercel'e NEXT_PUBLIC_ADMIN_USER_ID
-- olarak eklediğin ile AYNI UUID olmalı). Tarayıcında Ctrl+F / Cmd+F ile
-- "ADMIN_UUID_BURAYA" yazan yerleri bulup değiştirebilirsin.
-- Sonra: SQL Editor -> New query -> tamamını yapıştır, Run.

-- Sorular: sahibi veya admin silebilsin.
drop policy if exists "problems_delete_own" on problems;
create policy "problems_delete_own" on problems
  for delete using (auth.uid() = user_id or auth.uid() = 'ADMIN_UUID_BURAYA');

-- Yanıtlar: sahibi veya admin silebilsin.
drop policy if exists "answers_delete_own" on answers;
create policy "answers_delete_own" on answers
  for delete using (auth.uid() = user_id or auth.uid() = 'ADMIN_UUID_BURAYA');

-- İlanlar: sahibi veya admin silebilsin.
drop policy if exists "listings_delete_own" on listings;
create policy "listings_delete_own" on listings
  for delete using (auth.uid() = user_id or auth.uid() = 'ADMIN_UUID_BURAYA');

-- Garaj araçları: sahibi veya admin silebilsin.
drop policy if exists "garage_cars_delete_own" on garage_cars;
create policy "garage_cars_delete_own" on garage_cars
  for delete using (auth.uid() = user_id or auth.uid() = 'ADMIN_UUID_BURAYA');
