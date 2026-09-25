import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Bu uç nokta, Supabase'deki veritabanı trigger'ları (schema-push.sql)
// tarafından çağrılıyor — yeni bir mesaj veya cevap eklendiğinde
// otomatik tetikleniyor. Gelen isteği önce gizli anahtarla doğruluyor
// (böylece dışarıdan rastgele biri bildirim gönderemez), sonra hedef
// kullanıcının kayıtlı cihazlarına gerçek bildirimi gönderiyor.

const PUSH_SECRET = process.env.PUSH_WEBHOOK_SECRET;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:destek@rc-atolyesi.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(req: Request) {
  if (!PUSH_SECRET || req.headers.get('x-push-secret') !== PUSH_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'vapid not configured' }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const targetUserId = body?.target_user_id;
  const title = body?.title;

  if (!targetUserId || !title) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', targetUserId);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const payload = JSON.stringify({
    title,
    body: body?.body || '',
    url: body?.url || '/'
  });

  let sent = 0;
  // Hangi aboneliğin neden başarısız olduğunu görebilmek için (Supabase'in
  // net._http_response tablosunda bu cevap zaten kayıtlı oluyor, ayrıca bir
  // log sistemi kurmaya gerek yok — sorun çıkarsa oradan okuyabiliriz).
  const failed: { id: string; statusCode: number | null; message: string }[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: any) {
        failed.push({
          id: sub.id,
          statusCode: err?.statusCode ?? null,
          message: (err?.body || err?.message || 'bilinmeyen hata').toString().slice(0, 200)
        });

        // Abonelik artık geçersizse (kullanıcı bildirimi kapattı, tarayıcı
        // verisini sildi vb.) kaydı veritabanından temizliyoruz.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    })
  );

  return NextResponse.json({ ok: true, sent, total: subs.length, failed });
}
