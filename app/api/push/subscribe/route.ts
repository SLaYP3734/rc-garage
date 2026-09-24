import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Tarayıcıdan gelen bildirim aboneliğini (subscription) veritabanına
// kaydeder. Kullanıcı giriş yapmış olmalı, kayıt kendi hesabına yazılır.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, endpoint, p256dh, auth }, { onConflict: 'endpoint' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
