-- RC Atölyesi — İçerik Üretici rozeti + Blog yazma yetkisi
-- ============================================================
-- Bu dosya şunları ekliyor:
--   1) profiles.is_content_creator — admin panelinden verilen bir rozet.
--      Bu rozete sahip kullanıcılar Blog'a kendi yazılarını ekleyebiliyor.
--   2) blog_posts.author_id — hangi yazının kime ait olduğu (boşsa eski
--      admin yazıları gibi davranır).
--   3) set_content_creator() — admin panelindeki "İçerik Üretici Yap"
--      düğmesinin çağırdığı, sadece admin'in çalıştırabildiği fonksiyon.
--   4) Blog yazıları için güncellenmiş RLS kuralları: artık admin dışında,
--      içerik üreticisi de KENDİ ADINA yazı ekleyip kendi yazısını
--      düzenleyip silebiliyor.
--
-- ÇALIŞTIRMADAN ÖNCE aşağıdaki 4 yerde geçen "ADMIN_UUID_BURAYA" yazısını
-- kendi admin hesabının UUID'i ile değiştir (diğer dosyalardaki ile
-- birebir aynı olmalı).
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

alter table profiles add column if not exists is_content_creator boolean not null default false;

alter table blog_posts add column if not exists author_id uuid references profiles(id) on delete set null;

create or replace function public.set_content_creator(target_id uuid, is_creator boolean)
returns void as $$
begin
  if auth.uid()::text <> 'ADMIN_UUID_BURAYA' then
    raise exception 'yetkisiz';
  end if;

  update profiles set is_content_creator = is_creator where id = target_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Yazıları görme: yayınlanmış olanı herkes, taslakları admin ve yazının
-- sahibi görebilir.
drop policy if exists "blog_posts_select" on blog_posts;
create policy "blog_posts_select" on blog_posts
  for select using (
    published = true
    or auth.uid()::text = 'ADMIN_UUID_BURAYA'
    or auth.uid() = author_id
  );

-- Yazı ekleme: admin her zaman ekleyebilir; içerik üreticisi rozetine
-- sahip olan da KENDİ adına (author_id = kendisi) ekleyebilir.
drop policy if exists "blog_posts_insert_admin" on blog_posts;
drop policy if exists "blog_posts_insert_admin_or_creator" on blog_posts;
create policy "blog_posts_insert_admin_or_creator" on blog_posts
  for insert with check (
    auth.uid()::text = 'ADMIN_UUID_BURAYA'
    or (
      author_id = auth.uid()
      and exists (
        select 1 from profiles p where p.id = auth.uid() and p.is_content_creator = true
      )
    )
  );

-- Güncelleme/silme: admin her zaman, yazının sahibi de kendi yazısını
-- (rozeti sonradan kaldırılsa bile geçmiş yazılarını düzenleyebilsin diye
-- burada rozet şartı aranmıyor).
drop policy if exists "blog_posts_update_admin" on blog_posts;
create policy "blog_posts_update_admin_or_author" on blog_posts
  for update using (
    auth.uid()::text = 'ADMIN_UUID_BURAYA'
    or auth.uid() = author_id
  );

drop policy if exists "blog_posts_delete_admin" on blog_posts;
create policy "blog_posts_delete_admin_or_author" on blog_posts
  for delete using (
    auth.uid()::text = 'ADMIN_UUID_BURAYA'
    or auth.uid() = author_id
  );
