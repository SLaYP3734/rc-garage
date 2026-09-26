-- RC Atölyesi — İlanları admin panelinden "öne çıkarma" özelliği
-- ============================================================
-- ÇALIŞTIRMADAN ÖNCE:
-- 1) Aşağıda geçen "ADMIN_UUID_BURAYA" yazan HER yeri kendi admin
--    hesabının UUID'i ile değiştir (bulundur-değiştir).
-- 2) Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

alter table listings add column if not exists is_featured boolean not null default false;

create index if not exists listings_is_featured_idx on listings (is_featured);

-- Bu sütuna sadece admin dokunabilsin diye (normal "kendi ilanını
-- güncelle" politikası bu sütunu kapsamasın diye), güncelleme sadece
-- aşağıdaki fonksiyon üzerinden yapılabiliyor ve fonksiyon çağıranın
-- admin olup olmadığını kontrol ediyor.
create or replace function public.admin_set_listing_featured(target_id uuid, featured boolean)
returns void as $$
begin
  if auth.uid()::text <> 'ADMIN_UUID_BURAYA' then
    raise exception 'yetkisiz';
  end if;

  update listings set is_featured = featured where id = target_id;
end;
$$ language plpgsql security definer set search_path = public;
