import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

// Sadece admin hesabının, kayıtlı üyelerin e-posta adreslerini görmesini
// sağlar. E-posta adresleri Supabase'in "auth" şemasında tutulur ve normal
// (anon) bağlantıyla okunamaz — bu yüzden burada, kimlik doğrulamasını
// önce normal şekilde yapıp (gerçekten admin mi?), sonra service-role
// (yönetici) bağlantısıyla Supabase'in kullanıcı yönetim API'sini
// çağırıyoruz.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_USER_ID || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'server not configured' }, { status: 500 });
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceKey);

  // Supabase'in "listUsers" fonksiyonu sayfa sayfa döner (varsayılan 50
  // kişi). Toplu üye sayımız az olduğu için 1000'e kadar tek seferde
  // çekiyoruz, yine de ileride büyürse diye sayfalama döngüsü kurduk.
  const allUsers: { id: string; email: string | null; created_at: string }[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    allUsers.push(...data.users.map((u) => ({ id: u.id, email: u.email ?? null, created_at: u.created_at })));
    if (data.users.length < 1000) break;
    page++;
    if (page > 10) break; // güvenlik freni
  }

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, username');
  const usernameById = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));

  const result = allUsers
    .map((u) => ({
      id: u.id,
      email: u.email,
      username: usernameById.get(u.id) ?? null,
      created_at: u.created_at
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ users: result });
}
