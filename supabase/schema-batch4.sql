-- RC Atölyesi — Toplu Güncelleme #4
-- ============================================================
-- Bu dosya şunları ekliyor:
--   1) Spam/kötüye kullanım engeli (rate limiting) — mesaj, soru, cevap,
--      ilan, yorum ve teklif gönderiminde kısa sürede çok fazla kayıt
--      atılmasını veritabanı seviyesinde engelliyor.
--   2) İlan favorileme + favorilediğin ilanın fiyatı düşünce bildirim.
--
-- ÇALIŞTIRMADAN ÖNCE: aşağıda "ADMIN_UUID_BURAYA" yazan YERİ (1 tane),
-- kendi admin hesabının UUID'i ile değiştir — bu olmazsa admin hesabı da
-- rate limit'e takılabilir (örn. toplu mesaj gönderirken).
--
-- Sonra: Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

-- 1) SPAM ENGELİ (RATE LIMITING) ------------------------------------------

create or replace function public.enforce_rate_limit()
returns trigger as $$
declare
  user_col text := TG_ARGV[0];
  max_count int := TG_ARGV[1]::int;
  window_seconds int := TG_ARGV[2]::int;
  uid uuid;
  recent_count int;
begin
  uid := (to_jsonb(new) ->> user_col)::uuid;

  -- admin hesabı (toplu mesaj vb. için) bu kısıtlamadan muaf. (Metin
  -- karşılaştırması kasıtlı: ADMIN_UUID_BURAYA henüz değiştirilmemişse
  -- burası sadece "eşleşmez" der, hataya düşürmez.)
  if uid::text = 'ADMIN_UUID_BURAYA' then
    return new;
  end if;

  execute format(
    'select count(*) from %I where %I = $1 and created_at > now() - make_interval(secs => %s)',
    TG_TABLE_NAME, user_col, window_seconds
  ) into recent_count using uid;

  if recent_count >= max_count then
    raise exception 'Çok hızlı işlem yapıyorsun, biraz yavaşla ve birkaç dakika sonra tekrar dene.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_rate_limit_messages on messages;
create trigger trg_rate_limit_messages
before insert on messages
for each row execute function public.enforce_rate_limit('sender_id', '20', '60');

drop trigger if exists trg_rate_limit_problems on problems;
create trigger trg_rate_limit_problems
before insert on problems
for each row execute function public.enforce_rate_limit('user_id', '5', '300');

drop trigger if exists trg_rate_limit_answers on answers;
create trigger trg_rate_limit_answers
before insert on answers
for each row execute function public.enforce_rate_limit('user_id', '10', '60');

drop trigger if exists trg_rate_limit_listings on listings;
create trigger trg_rate_limit_listings
before insert on listings
for each row execute function public.enforce_rate_limit('user_id', '5', '300');

drop trigger if exists trg_rate_limit_listing_comments on listing_comments;
create trigger trg_rate_limit_listing_comments
before insert on listing_comments
for each row execute function public.enforce_rate_limit('user_id', '15', '60');

drop trigger if exists trg_rate_limit_listing_offers on listing_offers;
create trigger trg_rate_limit_listing_offers
before insert on listing_offers
for each row execute function public.enforce_rate_limit('buyer_id', '10', '60');

drop trigger if exists trg_rate_limit_garage_cars on garage_cars;
create trigger trg_rate_limit_garage_cars
before insert on garage_cars
for each row execute function public.enforce_rate_limit('user_id', '10', '300');

-- 2) İLAN FAVORİLEME + FİYAT DÜŞTÜ BİLDİRİMİ -------------------------------

create table if not exists listing_favorites (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists listing_favorites_listing_idx on listing_favorites (listing_id);
create index if not exists listing_favorites_user_idx on listing_favorites (user_id);

alter table listing_favorites enable row level security;

drop policy if exists "listing_favorites_select_own" on listing_favorites;
create policy "listing_favorites_select_own" on listing_favorites for select using (auth.uid() = user_id);

drop policy if exists "listing_favorites_insert_own" on listing_favorites;
create policy "listing_favorites_insert_own" on listing_favorites for insert with check (auth.uid() = user_id);

drop policy if exists "listing_favorites_delete_own" on listing_favorites;
create policy "listing_favorites_delete_own" on listing_favorites for delete using (auth.uid() = user_id);

create or replace function public.notify_price_drop()
returns trigger as $$
declare
  fav record;
begin
  if new.price is null or old.price is null or new.price >= old.price then
    return new;
  end if;

  for fav in select user_id from listing_favorites where listing_id = new.id loop
    begin
      perform net.http_post(
        url := 'https://rc-garage-three.vercel.app/api/push/notify',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-push-secret', 'qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'
        ),
        body := jsonb_build_object(
          'target_user_id', fav.user_id,
          'title', 'Favorilediğin ilanın fiyatı düştü',
          'body', new.title || ' — yeni fiyat: ' || new.price::text || ' TL',
          'url', '/ilan/' || new.slug
        )
      );
    exception when others then
      null;
    end;
  end loop;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_price_drop on listings;
create trigger trg_notify_price_drop
after update on listings
for each row execute function public.notify_price_drop();
