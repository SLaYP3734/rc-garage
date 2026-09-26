-- RC Atölyesi — Blog paylaşım kuralları + "Öne Çıkan Blog" vitrini
-- ============================================================
-- Bu dosya sadece şunu ekliyor: blog_posts.comment_count — bir yazının
-- kaç yorum aldığını otomatik takip eden sütun (diğer sayaçlarla
-- (answer_count, favorite_count, like_count) birebir aynı desen).
-- Ana sayfadaki "Haftanın Öne Çıkanları" kutusunda en çok yorum alan
-- yayınlanmış yazıyı "📖 Öne Çıkan Blog" olarak göstermek için kullanılıyor
-- (bkz. app/page.tsx, components/WeeklyShowcase.tsx).
--
-- Karakter/fotoğraf sayısı kuralları veritabanında değil, yazı ekranının
-- kendisinde (kod tarafında) kontrol ediliyor — bu dosyada SQL değişikliği
-- gerektirmiyor.
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

alter table blog_posts add column if not exists comment_count int not null default 0;

update blog_posts bp
set comment_count = (select count(*) from blog_comments bc where bc.post_id = bp.id);

create or replace function public.bump_blog_comment_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update blog_posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update blog_posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_bump_blog_comment_count on blog_comments;
create trigger trg_bump_blog_comment_count
after insert or delete on blog_comments
for each row execute function public.bump_blog_comment_count();
