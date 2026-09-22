import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Sunucu tarafında (Server Component, Route Handler) kullanılacak istemci.
// Bu sayede sorun sayfaları sunucuda render edilip arama motorları
// tarafından okunabilir hale gelir (asıl SEO düzeltmesi bu).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component içinden cookie set edilemez; middleware
            // veya bir Route Handler bunu üstlenir. Sessizce geçiyoruz.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Yukarıdaki gibi, Server Component sınırı.
          }
        }
      }
    }
  );
}
