-- RC Atölyesi — Çevrimiçi / Son Görülme
-- SQL Editor -> New query -> tamamını yapıştır, Run.

alter table profiles add column if not exists last_seen_at timestamptz;

-- Herkes birbirinin son görülme zamanını okuyabilsin (mesajlaşmada
-- "Çevrimiçi" / "X önce görüldü" göstermek için). Kendi son görülme
-- zamanını sadece kendisi güncelleyebilir.
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
