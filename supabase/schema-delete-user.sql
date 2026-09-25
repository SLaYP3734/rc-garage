-- RC Atölyesi — Admin Panelinden Kullanıcı Silme (Doğrudan Veritabanı)
-- ============================================================
-- Supabase'in kendi "kullanıcı sil" servisi (GoTrue) bazı hesaplarda
-- belirsiz bir "Database error deleting user" hatası veriyor — ama aynı
-- silme işlemi SQL Editor'dan "delete from auth.users where id = ...''
-- ile doğrudan çalıştırılınca sorunsuz çalışıyor. Bu fonksiyon, admin
-- panelindeki "Sil" butonunun da aynı doğrudan yöntemi kullanmasını
-- sağlıyor.
--
-- ÇALIŞTIRMADAN ÖNCE: aşağıda "ADMIN_UUID_BURAYA" yazan 2 YERİ kendi
-- admin hesabının UUID'i ile değiştir.
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

create or replace function public.admin_delete_user(target_id uuid)
returns void as $$
begin
  if auth.uid()::text <> 'ADMIN_UUID_BURAYA' then
    raise exception 'yetkisiz';
  end if;

  if target_id::text = 'ADMIN_UUID_BURAYA' then
    raise exception 'admin hesabi silinemez';
  end if;

  -- profiles ve ona bağlı her şey (sorular, ilanlar, mesajlar vs.)
  -- "on delete cascade" sayesinde otomatik silinir.
  delete from auth.users where id = target_id;
end;
$$ language plpgsql security definer set search_path = public, auth;
