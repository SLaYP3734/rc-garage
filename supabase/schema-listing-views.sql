-- İlan detay sayfasında "görüntülenme sayısı" göstermek için.
-- 1) listings tablosuna views sütunu ekleniyor (varsayılan 0).
-- 2) Herkesin (giriş yapmamış ziyaretçiler dahil) sayacı artırabilmesi için
--    RLS'i atlayan bir fonksiyon ekleniyor — mevcut "sadece ilan sahibi
--    güncelleyebilir" kuralını değiştirmeden, sadece bu tek sütunu artırıyor.

alter table public.listings
  add column if not exists views integer not null default 0;

create or replace function public.increment_listing_views(target_id uuid)
returns void as $$
begin
  update public.listings set views = views + 1 where id = target_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
