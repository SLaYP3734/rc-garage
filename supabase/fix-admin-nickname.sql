-- Yeni üyelere otomatik giden "hoş geldin" mesajı, admin hesabının
-- profildeki kullanıcı adıyla (nickname) görünüyor. Bunu "RC Atölyesi"
-- yapmak için admin hesabının username'ini güncelliyoruz.
--
-- ADMIN_UUID_BURAYA yerine kendi admin UUID'ini yaz (daha önce diğer
-- admin SQL dosyalarında kullandığın aynı UUID).

update public.profiles
set username = 'RC Atölyesi'
where id = 'ADMIN_UUID_BURAYA';
