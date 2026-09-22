-- RC Garage — Garaj Vitrini, Beğeniler, Liderlik Tablosu
-- Supabase panelinde: SQL Editor -> New query -> bu dosyanın tamamını
-- yapıştırıp çalıştır.

-- garage_cars tablosuna fotoğraf alanı ekleniyor (yoksa).
alter table garage_cars add column if not exists image_url text;
alter table garage_cars add column if not exists like_count int not null default 0;

-- garage_cars muhtemelen zaten vardı ama RLS'i garanti altına alıyoruz:
-- herkes (giriş yapmamış ziyaretçi dahil) görebilsin, sadece sahibi
-- ekleyip/silebilsin.
alter table garage_cars enable row level security;

drop policy if exists "garage_cars_select_all" on garage_cars;
create policy "garage_cars_select_all" on garage_cars for select using (true);

drop policy if exists "garage_cars_insert_own" on garage_cars;
create policy "garage_cars_insert_own" on garage_cars for insert with check (auth.uid() = user_id);

drop policy if exists "garage_cars_update_own" on garage_cars;
create policy "garage_cars_update_own" on garage_cars for update using (auth.uid() = user_id);

drop policy if exists "garage_cars_delete_own" on garage_cars;
create policy "garage_cars_delete_own" on garage_cars for delete using (auth.uid() = user_id);

-- Beğeniler
create table if not exists garage_likes (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references garage_cars(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (car_id, user_id)
);

create index if not exists garage_likes_car_idx on garage_likes (car_id);

alter table garage_likes enable row level security;

drop policy if exists "garage_likes_select_all" on garage_likes;
create policy "garage_likes_select_all" on garage_likes for select using (true);

drop policy if exists "garage_likes_insert_own" on garage_likes;
create policy "garage_likes_insert_own" on garage_likes for insert with check (auth.uid() = user_id);

drop policy if exists "garage_likes_delete_own" on garage_likes;
create policy "garage_likes_delete_own" on garage_likes for delete using (auth.uid() = user_id);

-- garage_cars.like_count sütununu otomatik güncel tutan trigger.
create or replace function bump_garage_car_like_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update garage_cars set like_count = like_count + 1 where id = new.car_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update garage_cars set like_count = greatest(like_count - 1, 0) where id = old.car_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_garage_like_count on garage_likes;
create trigger trg_bump_garage_like_count
after insert or delete on garage_likes
for each row execute function bump_garage_car_like_count();

-- Liderlik tablosu: en çok "çözüm" olarak kabul edilen cevabı yazan
-- kullanıcılar. Ana sayfadaki "Bu Ayın Yıldızları" burayı okuyor.
create or replace view top_helpers as
select
  p.id as user_id,
  p.username,
  count(a.id) as solved_count
from profiles p
join answers a on a.user_id = p.id and a.is_accepted = true
group by p.id, p.username
having count(a.id) > 0
order by solved_count desc
limit 20;

grant select on top_helpers to anon, authenticated;
