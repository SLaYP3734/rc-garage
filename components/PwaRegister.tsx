'use client';

import { useEffect } from 'react';

// Sayfa açılınca servis çalışanını (service worker) sessizce kaydeder.
// Bu sayede tarayıcı siteyi "yüklenebilir" (Ana Ekrana Ekle) olarak
// tanır ve statik dosyalar önbelleğe alınıp açılış hızlanır.
export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sessizce yut — kayıt başarısız olsa bile site normal çalışmaya devam etsin.
      });
    }
  }, []);

  return null;
}
