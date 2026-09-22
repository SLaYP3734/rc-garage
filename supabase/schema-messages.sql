-- RC Garage — Özel Mesajlaşma
-- Supabase panelinde: SQL Editor -> New query -> bu dosyanın tamamını
-- yapıştırıp çalıştır. Mevcut tablolara (profiles, problems, answers,
-- garage_cars) dokunmaz, sadece yeni bir "messages" tablosu ekler.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_sender_idx on messages (sender_id);
create index if not exists messages_receiver_idx on messages (receiver_id);
create index if not exists messages_created_at_idx on messages (created_at);

alter table messages enable row level security;

-- Bir mesajı sadece gönderen ve alan görebilir.
drop policy if exists "messages_select_own" on messages;
create policy "messages_select_own" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Sadece kendi adına mesaj gönderebilir.
drop policy if exists "messages_insert_own" on messages;
create policy "messages_insert_own" on messages
  for insert with check (auth.uid() = sender_id);

-- Alıcı, kendine gelen mesajı "okundu" olarak işaretleyebilsin diye.
drop policy if exists "messages_update_own_receiver" on messages;
create policy "messages_update_own_receiver" on messages
  for update using (auth.uid() = receiver_id);
