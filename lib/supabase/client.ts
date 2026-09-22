'use client';

import { createBrowserClient } from '@supabase/ssr';

// Tarayıcıda (client component'lerde) kullanılacak Supabase istemcisi.
// Auth durumu cookie üzerinden tutulur, böylece sunucu tarafı render de
// kullanıcının giriş yapıp yapmadığını bilebilir.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
