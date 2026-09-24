-- RC Atölyesi — İlanlarda Soru/Cevap + Teklif Sistemi
-- ============================================================
-- Bu dosya:
-- 1) İlanların altına "soru-cevap" (yorum) bölümü ekler
-- 2) Alıcıların teklif verebilmesini sağlar, satıcı "minimum teklif
--    tutarı" belirleyebilir
-- 3) Yeni soru/cevap ve yeni teklif geldiğinde bildirim gönderir
--    (URL ve gizli anahtar zaten dolu, değiştirmene gerek yok)
--
-- SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

-- Satıcı, ilanı oluştururken minimum kabul edeceği teklif tutarını
-- belirleyebilsin diye (boş bırakılabilir).
alter table listings add column if not exists min_offer_amount numeric;

-- ------------------------------------------------------------
-- SORU / CEVAP (yorumlar)
-- ------------------------------------------------------------
create table if not exists listing_comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references listing_comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists listing_comments_listing_idx on listing_comments (listing_id);

alter table listing_comments enable row level security;

drop policy if exists "listing_comments_select_all" on listing_comments;
create policy "listing_comments_select_all" on listing_comments for select using (true);

drop policy if exists "listing_comments_insert_own" on listing_comments;
create policy "listing_comments_insert_own" on listing_comments
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "listing_comments_delete_own" on listing_comments;
create policy "listing_comments_delete_own" on listing_comments
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TEKLİFLER
-- ------------------------------------------------------------
create table if not exists listing_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists listing_offers_listing_idx on listing_offers (listing_id);

alter table listing_offers enable row level security;

-- Teklifleri sadece ilan sahibi (tüm teklifler) ve teklifi veren kişi
-- (sadece kendi teklifi) görebilsin — rakip tekliflerin tutarı diğer
-- alıcılara açık olmasın.
drop policy if exists "listing_offers_select_own_or_owner" on listing_offers;
create policy "listing_offers_select_own_or_owner" on listing_offers
  for select using (
    auth.uid() = buyer_id
    or auth.uid() = (select l.user_id from listings l where l.id = listing_id)
  );

-- Teklif veren, ilan sahibi olamaz; belirlenmiş minimum tutarın altında
-- teklif giremez (minimum belirtilmemişse sınır yok).
drop policy if exists "listing_offers_insert_own" on listing_offers;
create policy "listing_offers_insert_own" on listing_offers
  for insert with check (
    auth.uid() = buyer_id
    and not public.is_banned(auth.uid())
    and auth.uid() <> (select l.user_id from listings l where l.id = listing_id)
    and amount >= coalesce((select l.min_offer_amount from listings l where l.id = listing_id), 0)
  );

-- Sadece ilan sahibi, gelen teklifi kabul/red durumuna güncelleyebilsin.
drop policy if exists "listing_offers_update_owner" on listing_offers;
create policy "listing_offers_update_owner" on listing_offers
  for update using (auth.uid() = (select l.user_id from listings l where l.id = listing_id));

-- ------------------------------------------------------------
-- BİLDİRİMLER
-- ------------------------------------------------------------
create or replace function public.notify_new_listing_comment()
returns trigger as $$
declare
  listing_owner uuid;
  listing_title text;
  listing_slug text;
  commenter_username text;
  parent_author uuid;
begin
  begin
    select user_id, title, slug into listing_owner, listing_title, listing_slug
    from listings where id = new.listing_id;

    select username into commenter_username from profiles where id = new.user_id;

    if new.parent_id is not null then
      -- Bu bir CEVAP — asıl soruyu soran kişiye bildirim git (kendi
      -- kendine cevap yazmadıysa).
      select user_id into parent_author from listing_comments where id = new.parent_id;

      if parent_author is not null and parent_author <> new.user_id then
        perform net.http_post(
          url := 'https://rc-garage-three.vercel.app/api/push/notify',
          headers := jsonb_build_object('Content-Type','application/json','x-push-secret','qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'),
          body := jsonb_build_object(
            'target_user_id', parent_author,
            'title', coalesce(commenter_username, 'Biri') || ' sorunu cevapladı',
            'body', coalesce(listing_title, 'İlan'),
            'url', '/ilan/' || coalesce(listing_slug, '')
          )
        );
      end if;
    end if;

    -- İlan sahibine (yorumu kendisi yazmadıysa) her durumda haber ver.
    if listing_owner is not null and listing_owner <> new.user_id then
      perform net.http_post(
        url := 'https://rc-garage-three.vercel.app/api/push/notify',
        headers := jsonb_build_object('Content-Type','application/json','x-push-secret','qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'),
        body := jsonb_build_object(
          'target_user_id', listing_owner,
          'title', coalesce(commenter_username, 'Biri') || ' ilanına ' || (case when new.parent_id is null then 'soru sordu' else 'yorum yaptı' end),
          'body', coalesce(listing_title, 'İlan'),
          'url', '/ilan/' || coalesce(listing_slug, '')
        )
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_listing_comment on listing_comments;
create trigger trg_notify_new_listing_comment
after insert on listing_comments
for each row execute function public.notify_new_listing_comment();


create or replace function public.notify_new_listing_offer()
returns trigger as $$
declare
  listing_owner uuid;
  listing_title text;
  listing_slug text;
  buyer_username text;
begin
  begin
    select user_id, title, slug into listing_owner, listing_title, listing_slug
    from listings where id = new.listing_id;

    select username into buyer_username from profiles where id = new.buyer_id;

    if listing_owner is not null then
      perform net.http_post(
        url := 'https://rc-garage-three.vercel.app/api/push/notify',
        headers := jsonb_build_object('Content-Type','application/json','x-push-secret','qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'),
        body := jsonb_build_object(
          'target_user_id', listing_owner,
          'title', '💰 ' || coalesce(buyer_username, 'Biri') || ' teklif verdi: ' || new.amount || ' TL',
          'body', coalesce(listing_title, 'İlan'),
          'url', '/ilan/' || coalesce(listing_slug, '')
        )
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_listing_offer on listing_offers;
create trigger trg_notify_new_listing_offer
after insert on listing_offers
for each row execute function public.notify_new_listing_offer();
