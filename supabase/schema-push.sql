-- RC Atölyesi — Bildirim (Push Notification) Sistemi
-- ============================================================
-- ÇALIŞTIRMADAN ÖNCE aşağıdaki 2 yeri kendi bilgilerinle değiştir:
-- 1) 'SITE_URL_BURAYA' -> sitenin tam adresi, örn:
--    https://rc-garage-three.vercel.app  (SONUNDA / OLMASIN)
-- 2) 'PUSH_SECRET_BURAYA' -> Claude'un sana ayrıca verdiği gizli anahtar
--    (bu, Vercel'e PUSH_WEBHOOK_SECRET olarak gireceğin değerle
--    BİREBİR AYNI olmalı)
--
-- Sonra: SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

-- Supabase'in Postgres'ten dışarıya HTTP isteği atmasını sağlayan eklenti.
create extension if not exists pg_net;

-- Her cihazın bildirim aboneliğini saklayan tablo.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_insert_own" on push_subscriptions;
create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_select_own" on push_subscriptions;
create policy "push_subscriptions_select_own" on push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_update_own" on push_subscriptions;
create policy "push_subscriptions_update_own" on push_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on push_subscriptions;
create policy "push_subscriptions_delete_own" on push_subscriptions
  for delete using (auth.uid() = user_id);

-- Yeni bir mesaj gelince alıcıya bildirim gönderen trigger.
create or replace function public.notify_new_message()
returns trigger as $$
declare
  sender_username text;
begin
  select username into sender_username from profiles where id = new.sender_id;

  perform net.http_post(
    url := 'SITE_URL_BURAYA/api/push/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', 'PUSH_SECRET_BURAYA'
    ),
    body := jsonb_build_object(
      'target_user_id', new.receiver_id,
      'title', coalesce(sender_username, 'RC Atölyesi üyesi') || ' sana mesaj gönderdi',
      'body', left(new.body, 120),
      'url', '/mesajlar/' || new.sender_id
    )
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_message on messages;
create trigger trg_notify_new_message
after insert on messages
for each row execute function public.notify_new_message();

-- Bir soruya yeni cevap gelince soru sahibine bildirim gönderen trigger
-- (kendi sorusuna kendi cevap verirse bildirim gitmiyor).
create or replace function public.notify_new_answer()
returns trigger as $$
declare
  problem_owner uuid;
  problem_title text;
  problem_slug text;
  answerer_username text;
begin
  select user_id, title, slug into problem_owner, problem_title, problem_slug
  from problems where id = new.problem_id;

  if problem_owner is null or problem_owner = new.user_id then
    return new;
  end if;

  select username into answerer_username from profiles where id = new.user_id;

  perform net.http_post(
    url := 'SITE_URL_BURAYA/api/push/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', 'PUSH_SECRET_BURAYA'
    ),
    body := jsonb_build_object(
      'target_user_id', problem_owner,
      'title', coalesce(answerer_username, 'Biri') || ' sorunu cevapladı',
      'body', problem_title,
      'url', '/sorun/' || problem_slug
    )
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_answer on answers;
create trigger trg_notify_new_answer
after insert on answers
for each row execute function public.notify_new_answer();
