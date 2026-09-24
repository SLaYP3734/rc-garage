import type { MetadataRoute } from 'next';

// PWA manifest dosyası — bu sayede kullanıcılar siteyi telefonlarına
// gerçek bir uygulama gibi ("Ana Ekrana Ekle") yükleyebiliyor: kendi
// ikonu, kendi açılış ekranı, tarayıcı çubuğu olmadan tam ekran açılış.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RC Atölyesi',
    short_name: 'RC Atölyesi',
    description:
      'RC araçlarla ilgili arıza, bakım ve upgrade sorularının sorulduğu Türkçe topluluk.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
