-- RC Garage — Kayıt formunu güçlendirme (Ad Soyad + Doğum Tarihi)
-- SQL Editor -> New query -> tamamını yapıştır, Run.

alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists birth_date date;

-- Kayıt olunca profiles tablosuna artık Ad Soyad ve doğum tarihini de
-- kaydeden güncellenmiş trigger fonksiyonu.
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
  return new;
end;
$$ language plpgsql security definer set search_path = public;
