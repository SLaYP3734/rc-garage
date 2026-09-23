-- RC Atölyesi — Takip Sistemi
-- SQL Editor -> New query -> tamamını yapıştır, Run.

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followed_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id)
);

create index if not exists follows_followed_idx on follows (followed_id);
create index if not exists follows_follower_idx on follows (follower_id);

alter table follows enable row level security;

drop policy if exists "follows_select_all" on follows;
create policy "follows_select_all" on follows for select using (true);

drop policy if exists "follows_insert_own" on follows;
create policy "follows_insert_own" on follows
  for insert with check (auth.uid() = follower_id and follower_id <> followed_id);

drop policy if exists "follows_delete_own" on follows;
create policy "follows_delete_own" on follows for delete using (auth.uid() = follower_id);
