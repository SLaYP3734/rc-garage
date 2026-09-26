-- RC Atölyesi — Galeri beğeni bildirimi
-- ============================================================
-- Biri, Galeri'de paylaşılan bir aracı beğendiğinde (❤️), aracın
-- sahibine "X kullanıcısı fotoğrafını beğendi" bildirimi gidiyor.
-- Diğer bildirimlerle aynı desen: URL ve gizli anahtar zaten dolu,
-- hiçbir yeri değiştirmene gerek yok. Bildirim gönderiminde bir sorun
-- olsa bile beğeni işlemi ASLA etkilenmez.
--
-- Çalıştırmak için: SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

create or replace function public.notify_new_garage_like()
returns trigger as $$
declare
  car_owner uuid;
  car_brand text;
  car_model text;
  liker_username text;
begin
  begin
    select user_id, brand, model into car_owner, car_brand, car_model
    from garage_cars where id = new.car_id;

    if car_owner is not null and car_owner <> new.user_id then
      select username into liker_username from profiles where id = new.user_id;

      perform net.http_post(
        url := 'https://rc-garage-three.vercel.app/api/push/notify',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-push-secret', 'qxaMI8oNSebqs7uWyu_nzpI1j8C8RHE9phVtW17rumY'
        ),
        body := jsonb_build_object(
          'target_user_id', car_owner,
          'title', coalesce(liker_username, 'Biri') || ' fotoğrafını beğendi',
          'body', trim(both ' ' from coalesce(car_brand, '') || ' ' || coalesce(car_model, '')),
          'url', '/vitrin'
        )
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_new_garage_like on garage_likes;
create trigger trg_notify_new_garage_like
after insert on garage_likes
for each row execute function public.notify_new_garage_like();
