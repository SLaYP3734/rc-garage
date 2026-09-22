'use client';

import { useEffect } from 'react';
import { unlockNotificationSound } from '@/lib/notificationSound';

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
