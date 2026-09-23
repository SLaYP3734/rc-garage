-- RC Atölyesi — Kullanıcı Erişimini Anında Kapatma (Ban)
-- ÖNEMLİ: Aşağıdaki 'ADMIN_UUID_BURAYA' yazan HER YERİ, kendi admin
-- hesabının UUID'i ile değiştir (schema-admin.sql'de kullandığın ile
-- AYNI UUID). Sonra: SQL Editor -> New query -> tamamını yapıştır, Run.

alter table profiles add column if not exists is_banned boolean not null default false;

-- Bir kullanıcının yasaklı olup olmadığını kontrol eden yardımcı fonksiyon.
create or replace function public.is_banned(uid uuid)
returns boolean as $$
  select coalesce((select p.is_banned from profiles p where p.id = uid), false);
$$ language sql stable;

-- Admin, herhangi bir profili (is_banned dahil) güncelleyebilsin.
drop policy if exists "profiles_admin_update" on profiles;
create policy "profiles_admin_update" on profiles
  for update using (auth.uid() = 'ADMIN_UUID_BURAYA');

-- Yasaklı kullanıcı yeni içerik/mesaj/yanıt/ilan/değerlendirme
-- ekleyemesin diye mevcut "insert" politikalarını güncelliyoruz.
drop policy if exists "problems_insert_own" on problems;
create policy "problems_insert_own" on problems
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "answers_insert_own" on answers;
create policy "answers_insert_own" on answers
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "listings_insert_own" on listings;
create policy "listings_insert_own" on listings
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "garage_cars_insert_own" on garage_cars;
create policy "garage_cars_insert_own" on garage_cars
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "messages_insert_own" on messages;
create policy "messages_insert_own" on messages
  for insert with check (auth.uid() = sender_id and not public.is_banned(auth.uid()));

drop policy if exists "seller_ratings_insert_own" on seller_ratings;
create policy "seller_ratings_insert_own" on seller_ratings
  for insert with check (auth.uid() = rater_id and rater_id <> seller_id and not public.is_banned(auth.uid()));
