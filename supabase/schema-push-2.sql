-- RC Atölyesi — Yeni bildirim türleri: "yeni takipçi" ve "cevabın kabul edildi"
-- ============================================================
-- Bu dosyada URL ve gizli anahtar ZATEN dolduruldu (daha önce kurduğumuz
-- değerlerle aynı) — SITE_URL_BURAYA / PUSH_SECRET_BURAYA değiştirmene
-- gerek YOK. Site adresini (domain) ileride değiştirirsen (örn.
-- rcatolyesi.com alırsan) bu dosyayı tekrar çalıştırıp aşağıdaki iki
-- 'https://rc-garage-three.vercel.app' kısmını yeni adresle güncellemen
-- yeterli olacak.
--
-- Diğer bildirimler gibi (mesaj/cevap), burada da bildirim gönderiminde
-- bir sorun olsa bile ana işlem (takip etme / cevap kabul etme) ASLA
-- etkilenmiyor — begin/exception bloğu bunu garantiliyor.
--
-- Çalıştırmak için: SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

create or replace function public.notify_new_follower()
returns trigger as $$
declare
  follower_username text;
begin
  begin
    select username into follower_username from profiles where id = new.follower_id;

    perform net.http_post(
      url := 'https://rc-garage-three.vercel.app/api/push/notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-secret', 'qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'
      ),
      body := jsonb_build_object(
        'target_user_id', new.followed_id,
        'title', coalesce(follower_username, 'Biri') || ' seni takip etmeye başladı',
        'body', 'Profiline göz atmak ister misin?',
        'url', '/satici/' || coalesce(follower_username, '')
      )
    );
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_follower on follows;
create trigger trg_notify_new_follower
after insert on follows
for each row execute function public.notify_new_follower();


create or replace function public.notify_answer_accepted()
returns trigger as $$
declare
  problem_title text;
  problem_slug text;
begin
  begin
    if new.is_accepted = true and (old.is_accepted is distinct from new.is_accepted) then
      select title, slug into problem_title, problem_slug from problems where id = new.problem_id;

      perform net.http_post(
        url := 'https://rc-garage-three.vercel.app/api/push/notify',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-push-secret', 'qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'
        ),
        body := jsonb_build_object(
          'target_user_id', new.user_id,
          'title', '🎉 Cevabın kabul edildi!',
          'body', coalesce(problem_title, 'Bir sorun'),
          'url', '/sorun/' || coalesce(problem_slug, '')
        )
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_answer_accepted on answers;
create trigger trg_notify_answer_accepted
after update on answers
for each row execute function public.notify_answer_accepted();
