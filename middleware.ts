import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Supabase oturum çerezini her istekte tazeler. Bu olmadan giriş yapmış
// kullanıcı bir süre sonra sunucu tarafında "çıkış yapmış" gibi görünebilir.
//
// Tamamı try/catch içinde: ortam değişkenleri eksik/yanlışsa ya da
// Supabase'e ulaşılamıyorsa, bu middleware sitenin tamamını kilitlemek
// yerine isteği olduğu gibi geçirir (kullanıcı sadece giriş yapmamış
// gibi görünür, sayfa hatası almaz).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        }
      }
    });

    await supabase.auth.getUser();
  } catch (err) {
    console.error('middleware auth refresh failed:', err);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)']
};
