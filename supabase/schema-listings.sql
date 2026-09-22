-- RC Garage — "Al / Sat" bölümü
-- Supabase panelinde: SQL Editor -> New query -> bu dosyanın tamamını
-- yapıştırıp çalıştır. Mevcut tablolara dokunmaz, sadece yeni bir
-- "listings" tablosu ekler.

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  brand text,
  model text,
  category text,
  condition text not null default 'kullanilmis' check (condition in ('yeni', 'kullanilmis')),
  price numeric,
  description text not null,
  image_url text,
  status text not null default 'active' check (status in ('active', 'sold')),
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists listings_created_at_idx on listings (created_at desc);
create index if not exists listings_category_idx on listings (category);
create index if not exists listings_status_idx on listings (status);
create index if not exists listings_slug_idx on listings (slug);

alter table listings enable row level security;

-- İlanlar herkese (giriş yapmamış ziyaretçiye ve Google'a) açık okunur.
drop policy if exists "listings_select_all" on listings;
create policy "listings_select_all" on listings for select using (true);

drop policy if exists "listings_insert_own" on listings;
create policy "listings_insert_own" on listings for insert with check (auth.uid() = user_id);

drop policy if exists "listings_update_own" on listings;
create policy "listings_update_own" on listings for update using (auth.uid() = user_id);

drop policy if exists "listings_delete_own" on listings;
create policy "listings_delete_own" on listings for delete using (auth.uid() = user_id);
