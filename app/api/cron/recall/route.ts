import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron her gün bu adresi çağırır (vercel.json -> crons). Amaç:
// birkaç gündür siteye uğramamış ama bildirimi açık olan üyelere,
// "seni özledik" tarzı nazik bir hatırlatma bildirimi göndermek.
// Aynı kişiye çok sık gitmesin diye en az 6 günde bir gönderiyoruz
// (profiles.last_recall_sent_at ile takip ediliyor).

const CRON_SECRET = process.env.CRON_SECRET;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:destek@rc-atolyesi.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const INACTIVE_DAYS = 3;
const COOLDOWN_DAYS = 6;
const MAX_USERS_PER_RUN = 200;

const RECALL_MESSAGES = [
  'RC dünyasında neler oldu görmek ister misin?',
  'Bir süredir görünmüyorsun, yeni sorular ve ilanlar birikti.',
  'Garajındaki arkadaşlar seni bekliyor. Bir bakıver!'
];

export async function GET(req: Request) {
  if (!CRON_SECRET || req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'vapid not configured' }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const inactiveSince = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const cooldownSince = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: candidatesError } = await supabaseAdmin
    .from('profiles')
    .select('id, username')
    .lt('last_seen_at', inactiveSince)
    .or(`last_recall_sent_at.is.null,last_recall_sent_at.lt.${cooldownSince}`)
    .limit(MAX_USERS_PER_RUN);

  if (candidatesError || !candidates || candidates.length === 0) {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0 });
  }

  const candidateIds = candidates.map((c) => c.id);

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', candidateIds);

  let sent = 0;
  const touchedUserIds = new Set<string>();

  if (subs && subs.length > 0) {
    const body = RECALL_MESSAGES[Math.floor(Math.random() * RECALL_MESSAGES.length)];
    const payload = JSON.stringify({ title: 'RC Atölyesi seni özledi 👋', body, url: '/' });

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
          touchedUserIds.add(sub.user_id);
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );
  }

  // Bildirimi gitsin gitmesin, bu turda değerlendirilen herkesin
  // last_recall_sent_at'ini güncelliyoruz ki her gün aynı kişiler için
  // tekrar tekrar sorgu yapmayalım (en az COOLDOWN_DAYS gün bekleyecekler).
  await supabaseAdmin
    .from('profiles')
    .update({ last_recall_sent_at: new Date().toISOString() })
    .in('id', candidateIds);

  return NextResponse.json({ ok: true, candidates: candidates.length, sent });
}
