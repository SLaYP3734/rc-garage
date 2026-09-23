-- RC Atölyesi — Satıcı Puanlama ve Rütbe Sistemi
-- SQL Editor -> New query -> tamamını yapıştır, Run.

create table if not exists seller_ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  rater_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, rater_id)
);

create index if not exists seller_ratings_seller_idx on seller_ratings (seller_id);
create index if not exists seller_ratings_listing_idx on seller_ratings (listing_id);

alter table seller_ratings enable row level security;

drop policy if exists "seller_ratings_select_all" on seller_ratings;
create policy "seller_ratings_select_all" on seller_ratings for select using (true);

drop policy if exists "seller_ratings_insert_own" on seller_ratings;
create policy "seller_ratings_insert_own" on seller_ratings
  for insert with check (auth.uid() = rater_id and rater_id <> seller_id);

-- Satıcı başına ortalama puan ve değerlendirme sayısı.
create or replace view seller_rating_stats as
select
  seller_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*) as rating_count
from seller_ratings
group by seller_id;

grant select on seller_rating_stats to anon, authenticated;

-- Ana sayfadaki "En Güvenilir Satıcılar" listesi bunu okuyor: satılan ilan
-- sayısı en çoktan aza, puanı yüksekten düşüğe sıralı satıcılar.
create or replace view top_sellers as
select
  l.user_id as user_id,
  count(*) filter (where l.status = 'sold') as sold_count,
  coalesce(s.avg_rating, 0) as avg_rating,
  coalesce(s.rating_count, 0) as rating_count
from listings l
left join seller_rating_stats s on s.seller_id = l.user_id
group by l.user_id, s.avg_rating, s.rating_count
having count(*) filter (where l.status = 'sold') > 0
order by sold_count desc, avg_rating desc
limit 20;

grant select on top_sellers to anon, authenticated;
