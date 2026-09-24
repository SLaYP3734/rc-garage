import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Tarayıcıdan gelen bildirim aboneliğini (subscription) veritabanına
// kaydeder. Kullanıcı giriş yapmış olmalı.
//
// ÖNEMLİ: Aynı cihaz/tarayıcı (aynı "endpoint") daha önce BAŞKA bir
// hesaba kayıtlı olabilir (örn. aynı telefonda önce SLaYP, şimdi admin
// ile giriş yapıldı). Bu durumda o cihazın bildirim sahipliğinin şimdiki
// hesaba devredilmesi gerekiyor — ama normal (RLS korumalı) bağlantı
// sadece "kendi" kaydını güncelleyebildiği için bu devir sessizce
// reddediliyordu. Bu yüzden burada service-role (RLS'i atlayan) bir
// bağlantı kullanıyoruz: kimliği önce normal şekilde doğruluyoruz, kayıt
// işlemini ise service-role ile yapıyoruz ki devir her zaman çalışsın.
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'server not configured' }, { status: 500 });
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceKey);

  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert({ user_id: user.id, endpoint, p256dh, auth }, { onConflict: 'endpoint' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
