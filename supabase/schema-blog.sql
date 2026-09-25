-- RC Atölyesi — Blog Modülü
-- ============================================================
-- Bu dosya şunları ekliyor:
--   1) blog_posts — sadece admin'in yazabildiği, SEO'ya uygun bakım/
--      rehber yazılarının tutulduğu tablo (zengin metin/fotoğraf).
--   2) blog_comments — yazıların altına herkesin yorum yapabildiği tablo.
--
-- ÇALIŞTIRMADAN ÖNCE: aşağıda "ADMIN_UUID_BURAYA" yazan 3 YERİ kendi
-- admin hesabının UUID'i ile değiştir (diğer dosyalarda kullandığın
-- UUID ile birebir aynı olmalı).
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

-- 1) BLOG YAZILARI ----------------------------------------------------------

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  cover_image_url text,
  content text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on blog_posts (published, created_at desc);

alter table blog_posts enable row level security;

-- Herkes yayınlanmış yazıları görebilir; admin taslakları da görebilir.
drop policy if exists "blog_posts_select" on blog_posts;
create policy "blog_posts_select" on blog_posts
  for select using (published = true or auth.uid()::text = 'ADMIN_UUID_BURAYA');

drop policy if exists "blog_posts_insert_admin" on blog_posts;
create policy "blog_posts_insert_admin" on blog_posts
  for insert with check (auth.uid()::text = 'ADMIN_UUID_BURAYA');

drop policy if exists "blog_posts_update_admin" on blog_posts;
create policy "blog_posts_update_admin" on blog_posts
  for update using (auth.uid()::text = 'ADMIN_UUID_BURAYA');

drop policy if exists "blog_posts_delete_admin" on blog_posts;
create policy "blog_posts_delete_admin" on blog_posts
  for delete using (auth.uid()::text = 'ADMIN_UUID_BURAYA');

-- updated_at her güncellemede kendiliğinden güncellensin.
create or replace function public.touch_blog_post_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_blog_post_updated_at on blog_posts;
create trigger trg_touch_blog_post_updated_at
before update on blog_posts
for each row execute function public.touch_blog_post_updated_at();

-- 2) BLOG YORUMLARI -----------------------------------------------------------

create table if not exists blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_idx on blog_comments (post_id, created_at);

alter table blog_comments enable row level security;

drop policy if exists "blog_comments_select_all" on blog_comments;
create policy "blog_comments_select_all" on blog_comments for select using (true);

drop policy if exists "blog_comments_insert_own" on blog_comments;
create policy "blog_comments_insert_own" on blog_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "blog_comments_delete_own" on blog_comments;
create policy "blog_comments_delete_own" on blog_comments
  for delete using (auth.uid() = user_id or auth.uid()::text = 'ADMIN_UUID_BURAYA');

-- Yorumlarda da spam engeli (aynı rate-limit fonksiyonu, schema-batch4.sql'de
-- tanımlı — o dosya bu dosyadan ÖNCE çalıştırılmış olmalı).
drop trigger if exists trg_rate_limit_blog_comments on blog_comments;
create trigger trg_rate_limit_blog_comments
before insert on blog_comments
for each row execute function public.enforce_rate_limit('user_id', '15', '60');
