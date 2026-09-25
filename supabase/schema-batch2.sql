-- RC Atölyesi — Toplu Güncelleme #2
-- ============================================================
-- Bu dosya şunları ekliyor:
--   1) Cevaplara "beğenme" özelliği (answer_likes tablosu + answers.like_count)
--   2) Ziyaretçi istatistikleri için günlük kayıt (visitor_days) — admin
--      panelindeki bugün/hafta/ay grafiği bunu okuyor
--   3) Yeni kayıt olan üyeye otomatik "hoş geldin" mesajı
--
-- ÇALIŞTIRMADAN ÖNCE: aşağıda "ADMIN_UUID_BURAYA" yazan YERİ (1 tane),
-- kendi admin hesabının UUID'i ile değiştir (Vercel'deki
-- NEXT_PUBLIC_ADMIN_USER_ID ile birebir aynı olmalı — schema-admin.sql'de
-- kullandığın değerin aynısı).
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- Bu dosyayı tekrar çalıştırmak güvenlidir (üzerine yazar, veri kaybetmez).
-- ============================================================

-- 1) CEVAP BEĞENME -------------------------------------------------------

alter table answers add column if not exists like_count int not null default 0;

create table if not exists answer_likes (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references answers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (answer_id, user_id)
);

create index if not exists answer_likes_answer_idx on answer_likes (answer_id);

alter table answer_likes enable row level security;

drop policy if exists "answer_likes_select_all" on answer_likes;
create policy "answer_likes_select_all" on answer_likes for select using (true);

drop policy if exists "answer_likes_insert_own" on answer_likes;
create policy "answer_likes_insert_own" on answer_likes for insert with check (auth.uid() = user_id);

drop policy if exists "answer_likes_delete_own" on answer_likes;
create policy "answer_likes_delete_own" on answer_likes for delete using (auth.uid() = user_id);

create or replace function bump_answer_like_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update answers set like_count = like_count + 1 where id = new.answer_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update answers set like_count = greatest(like_count - 1, 0) where id = old.answer_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_answer_like_count on answer_likes;
create trigger trg_bump_answer_like_count
after insert or delete on answer_likes
for each row execute function bump_answer_like_count();

-- Bir cevap beğenilince, cevabı yazan kişiye "X cevabını beğendi" bildirimi.
create or replace function public.notify_answer_liked()
returns trigger as $$
declare
  answer_owner uuid;
  problem_slug text;
  liker_username text;
begin
  begin
    select a.user_id, p.slug into answer_owner, problem_slug
    from answers a join problems p on p.id = a.problem_id
    where a.id = new.answer_id;

    if answer_owner is null or answer_owner = new.user_id then
      return new;
    end if;

    select username into liker_username from profiles where id = new.user_id;

    perform net.http_post(
      url := 'https://rc-garage-three.vercel.app/api/push/notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-secret', 'qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'
      ),
      body := jsonb_build_object(
        'target_user_id', answer_owner,
        'title', coalesce(liker_username, 'Biri') || ' cevabını beğendi',
        'body', 'Cevabın beğenildi, göz atmak ister misin?',
        'url', '/sorun/' || coalesce(problem_slug, '')
      )
    );
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_answer_liked on answer_likes;
create trigger trg_notify_answer_liked
after insert on answer_likes
for each row execute function public.notify_answer_liked();

-- 2) ZİYARETÇİ İSTATİSTİĞİ (gün/hafta/ay) --------------------------------
-- live_visitors sadece "şu an" kimin sitede olduğunu tutuyor (satırlar
-- üzerine yazılıyor), geçmişi tutmuyor. Bu yeni tablo her ziyaretçinin
-- her GÜN için tek bir satır bırakmasını sağlıyor, böylece "bugün kaç
-- farklı kişi geldi / bu hafta / bu ay" hesaplanabiliyor. Kişisel veri
-- içermiyor (sadece rastgele oturum kimliği + tarih).

create table if not exists public.visitor_days (
  day date not null,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (day, session_id)
);

alter table public.visitor_days enable row level security;

drop policy if exists "visitor_days_insert_anyone" on public.visitor_days;
create policy "visitor_days_insert_anyone" on public.visitor_days
  for insert with check (true);

drop policy if exists "visitor_days_select_anyone" on public.visitor_days;
create policy "visitor_days_select_anyone" on public.visitor_days
  for select using (true);

-- Tablo sonsuza kadar büyümesin: 90 günden eski kayıtlar silinebilsin.
drop policy if exists "visitor_days_delete_stale" on public.visitor_days;
create policy "visitor_days_delete_stale" on public.visitor_days
  for delete using (day < (current_date - interval '90 days'));

-- 3) KAYIT OLUNCA OTOMATİK "HOŞ GELDİN" MESAJI ---------------------------
-- Yeni üye kayıt olunca, Mesajlar kutusuna admin hesabından otomatik bir
-- karşılama/bilgilendirme mesajı düşüyor. Mesaj içeriğini istediğin zaman
-- burada değiştirip bu dosyayı tekrar çalıştırabilirsin.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, birth_date)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'birth_date', '')::date
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    birth_date = coalesce(excluded.birth_date, profiles.birth_date);

  begin
    insert into public.messages (sender_id, receiver_id, body)
    values (
      'ADMIN_UUID_BURAYA',
      new.id,
      'RC Atölyesi''ne hoş geldin!' || chr(10) || chr(10) ||
      'Burada RC araçlarla ilgili sorularını sorabilir, tecrübeli üyelerden yardım alabilir, garajını paylaşabilir ve Al/Sat bölümünden ikinci el parça/araç alıp satabilirsin.' || chr(10) || chr(10) ||
      'Kısa kurallar: birbirimize saygılı olalım, alım-satımda dolandırıcılığa karşı dikkatli olalım (mümkünse elden teslim tercih et), ve kurallara aykırı bir şey görürsen bize bu mesajdan yazarak bildirebilirsin.' || chr(10) || chr(10) ||
      'İyi eğlenceler!'
    );
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
