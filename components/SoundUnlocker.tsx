'use client';

import { useEffect } from 'react';
import { unlockNotificationSound } from '@/lib/notificationSound';

<<<<<<< HEAD
// Görünmez bir bileşen: kullanıcı sayfaya ilk kez dokunduğunda/tıkladığında
// bildirim sesi sistemini "kilidini açar". Bu olmadan telefon tarayıcıları
// arka planda otomatik çalan mesaj sesini sessizce engelliyor.
=======
>>>>>>> 291b4831e3517893e10dd462ce605f94cd306951
export default function SoundUnlocker() {
  useEffect(() => {
    function handler() {
      unlockNotificationSound();
    }

    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    window.addEventListener('click', handler, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
    };
  }, []);

  return null;
}
