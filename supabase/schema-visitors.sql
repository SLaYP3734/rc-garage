-- RC Atölyesi — Anlık ziyaretçi sayısı
-- ============================================================
-- Siteye giren HERKESİN (üye olsun olmasın) "nabzını" tutan basit bir
-- tablo. Her ziyaretçinin tarayıcısı ~30 saniyede bir kendi rastgele
-- oturum kimliğini günceller; admin panelinde son 2 dakika içinde
-- nabız atan farklı oturum sayısı = "şu an sitede kaç kişi var".
--
-- Kişisel veri (isim, e-posta, IP vs.) İÇERMİYOR — sadece rastgele bir
-- kimlik ve zaman damgası.
--
-- SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

create table if not exists public.live_visitors (
  session_id text primary key,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.live_visitors enable row level security;

-- Herkes (giriş yapmamış ziyaretçiler dahil) kendi nabzını ekleyebilsin/güncelleyebilsin.
drop policy if exists "live_visitors_insert_anyone" on public.live_visitors;
create policy "live_visitors_insert_anyone" on public.live_visitors
  for insert with check (true);

drop policy if exists "live_visitors_update_anyone" on public.live_visitors;
create policy "live_visitors_update_anyone" on public.live_visitors
  for update using (true);

-- Sayıyı hesaplayabilmek için okuma da herkese (özellikle admin paneline) açık.
drop policy if exists "live_visitors_select_anyone" on public.live_visitors;
create policy "live_visitors_select_anyone" on public.live_visitors
  for select using (true);

-- Bir günden eski kayıtlar zamanla silinebilsin diye (tabloyu şişirmesin) —
-- politika sadece ZATEN BAYAT olan satırların silinmesine izin veriyor,
-- aktif birinin kaydı asla bu şekilde silinemez.
drop policy if exists "live_visitors_delete_stale" on public.live_visitors;
create policy "live_visitors_delete_stale" on public.live_visitors
  for delete using (last_seen_at < now() - interval '1 day');
