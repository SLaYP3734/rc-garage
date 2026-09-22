-- RC Garage — "Sorun Sor" bölümü için yeni tablolar.
-- Supabase panelinde: SQL Editor -> New query -> bu dosyanın tamamını
-- yapıştırıp çalıştır. garage_cars tablosuna dokunulmuyor. profiles
-- tablosu ve kayıt-olunca-otomatik-satır-oluşturma zaten kuruluysa
-- aşağıdaki "if not exists" ve "or replace" ifadeleri sayesinde bu
-- betik hata vermeden, var olanın üstüne zarar vermeden çalışır.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Kayıt olunca profiles tablosuna otomatik satır ekleyen trigger.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Not: user_id, auth.users yerine profiles(id) tablosuna referans
-- veriyor. profiles.id zaten auth.users.id ile aynı (kayıt olurken
-- birebir kopyalanıyor), ama bu sayede Supabase sorgularında
-- "problems(...).profiles(username)" şeklinde otomatik ilişki kurup
-- kullanıcı adını tek sorguda çekebiliyoruz.
create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  brand text,
  model text,
  category text,
  description text not null,
  image_url text,
  status text not null default 'open' check (status in ('open', 'discussing', 'solved')),
  slug text not null unique,
  answer_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists problems_created_at_idx on problems (created_at desc);
create index if not exists problems_category_idx on problems (category);
create index if not exists problems_slug_idx on problems (slug);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists answers_problem_id_idx on answers (problem_id);

-- answer_count sütununu otomatik güncel tutan trigger.
create or replace function bump_problem_answer_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update problems set answer_count = answer_count + 1 where id = new.problem_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update problems set answer_count = greatest(answer_count - 1, 0) where id = old.problem_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_answer_count on answers;
create trigger trg_bump_answer_count
after insert or delete on answers
for each row execute function bump_problem_answer_count();

-- Row Level Security: sorular ve yanıtlar herkese (giriş yapmamış
-- ziyaretçiye ve Google'a) açık okunur, ama sadece giriş yapmış
-- kullanıcı kendi adına yazabilir.
alter table problems enable row level security;
alter table answers enable row level security;

drop policy if exists "problems_select_all" on problems;
create policy "problems_select_all" on problems for select using (true);

drop policy if exists "problems_insert_own" on problems;
create policy "problems_insert_own" on problems for insert with check (auth.uid() = user_id);

drop policy if exists "problems_update_own" on problems;
create policy "problems_update_own" on problems for update using (auth.uid() = user_id);

drop policy if exists "answers_select_all" on answers;
create policy "answers_select_all" on answers for select using (true);

drop policy if exists "answers_insert_own" on answers;
create policy "answers_insert_own" on answers for insert with check (auth.uid() = user_id);

-- Bir sorunun sahibi, o soruya gelen HERHANGİ bir yanıtı "kabul edilen
-- yanıt" olarak işaretleyebilsin diye (kendi yanıtı olmasa bile) ayrı
-- bir update politikası:
drop policy if exists "answers_update_by_problem_owner" on answers;
create policy "answers_update_by_problem_owner" on answers
  for update using (
    auth.uid() = (select user_id from problems where id = problem_id)
  );
