import type { createClient } from '@/lib/supabase/client';

// supabase.auth.getUser() sunucuya gidip token'ı doğruluyor — PWA telefon
// uygulaması az önce açıldığında (özellikle Android'de) internet bağlantısı
// tam hazır olmadan bu istek atılırsa hatayla/timeout ile sonuçlanabiliyor
// ve kullanıcı aslında giriş yapmışken "giriş yapmamış" gibi görünüp
// gereksiz yere tekrar login ekranına düşüyordu.
//
// Bu yardımcı fonksiyon önce getUser() dener, başarısız olursa (network
// hatası vs.) cihazda zaten saklı olan oturuma (getSession — ağa gitmez,
// anında döner) bakar. Böylece geçici bir bağlantı sorunu kullanıcıyı
// oturumdan atmış gibi göstermiyor.
export async function getCurrentUser(supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) return data.user;
  } catch {
    // yut, aşağıda getSession ile tekrar denenecek
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}
