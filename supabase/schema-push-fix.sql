-- RC Atölyesi — Bildirim Sisteminde GÜVENLİ DÜZELTME
-- ============================================================
-- ÖNEMLİ: Dün eklediğimiz bildirim sistemi bir tasarım hatası
-- içeriyordu — bildirim gönderilirken küçük bir sorun olsa bile bu,
-- mesajın/cevabın SİTEYE KAYDEDİLMESİNİ de engelliyordu. Bu dosya o
-- hatayı düzeltiyor: bundan sonra bildirim gönderimi başarısız olsa
-- bile mesaj/cevap her zaman kaydedilecek, bildirim sorunu en kötü
-- ihtimalle sadece bildirimin gitmemesine sebep olacak.
--
-- ÇALIŞTIRMADAN ÖNCE (dün yaptığın gibi) aşağıdaki 4 yeri değiştir:
-- 1) ve 2) 'SITE_URL_BURAYA' -> https://rc-garage-three.vercel.app
--    (sonunda / OLMADAN, kendi domain'in neyse onu yaz)
-- 3) ve 4) 'PUSH_SECRET_BURAYA' -> Vercel'e PUSH_WEBHOOK_SECRET olarak
--    girdiğin değerin BİREBİR AYNISI
--
-- Bu dosyayı çalıştırmak GÜVENLİDİR, daha önce schema-push.sql'i
-- çalıştırmış olsan da olmasan da sorun olmaz (üzerine güncelliyor).
-- Sonra: SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

create or replace function public.notify_new_message()
returns trigger as $$
declare
  sender_username text;
begin
  begin
    select username into sender_username from profiles where id = new.sender_id;

    perform net.http_post(
      url := 'SITE_URL_BURAYA/api/push/notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-secret', 'PUSH_SECRET_BURAYA'
      ),
      body := jsonb_build_object(
        'target_user_id', new.receiver_id,
        'title', coalesce(sender_username, 'RC Atölyesi üyesi') || ' sana mesaj gönderdi',
        'body', left(new.body, 120),
        'url', '/mesajlar/' || new.sender_id
      )
    );
  exception when others then
    -- Bildirim gönderiminde HERHANGİ bir sorun olursa (yanlış adres,
    -- eklenti kapalı, ağ hatası...) burada sessizce yutuluyor.
    -- Mesajın kendisi (aşağıdaki "return new") HER ZAMAN kaydedilir.
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_message on messages;
create trigger trg_notify_new_message
after insert on messages
for each row execute function public.notify_new_message();

create or replace function public.notify_new_answer()
returns trigger as $$
declare
  problem_owner uuid;
  problem_title text;
  problem_slug text;
  answerer_username text;
begin
  begin
    select user_id, title, slug into problem_owner, problem_title, problem_slug
    from problems where id = new.problem_id;

    if problem_owner is not null and problem_owner <> new.user_id then
      select username into answerer_username from profiles where id = new.user_id;

      perform net.http_post(
        url := 'SITE_URL_BURAYA/api/push/notify',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-push-secret', 'PUSH_SECRET_BURAYA'
        ),
        body := jsonb_build_object(
          'target_user_id', problem_owner,
          'title', coalesce(answerer_username, 'Biri') || ' sorunu cevapladı',
          'body', problem_title,
          'url', '/sorun/' || problem_slug
        )
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_answer on answers;
create trigger trg_notify_new_answer
after insert on answers
for each row execute function public.notify_new_answer();
