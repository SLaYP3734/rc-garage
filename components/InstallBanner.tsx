'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { pushSupported, isStandalone, requestAndSubscribe, VAPID_PUBLIC_KEY } from '@/lib/pushClient';
import ModalPortal from '@/components/ModalPortal';

const DISMISS_KEY = 'rc-install-banner-dismissed-at';
const DISMISS_MINUTES = 30;
// İnce şerit fark edilmiyordu, bu yüzden artık ortada açılan bir pencere
// (modal) olarak gösteriyoruz — sayfa yüklendikten kısa bir süre sonra
// otomatik açılıyor ki ilk anda "araya giren bir şey" gibi hissettirmesin.
const AUTO_OPEN_DELAY_MS = 900;

function isDismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!dismissedAt) return false;
    const minutesSince = (Date.now() - dismissedAt) / (1000 * 60);
    return minutesSince < DISMISS_MINUTES;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage kapalıysa sorun değil, sadece hatırlanmaz.
  }
}

type Mode = 'none' | 'ios-install' | 'android-install' | 'enable-notifications';

// Siteye linkle gelen herkese, telefonuna göre en pratik adımı gösteren bir
// açılır pencere: iPhone'da "Ana Ekrana Ekle" talimatı, Android'de tek
// dokunuşla kurulum, uygulama zaten kuruluysa da bildirimleri açma
// hatırlatması. Eskiden ince bir şerit olarak üstte duruyordu ama fark
// edilmiyordu — artık sayfa açılınca ortada beliren bir pencere.
// Kapatılırsa 30 dakika boyunca tekrar çıkmaz.
export default function InstallBanner() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('none');
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDismissedRecently()) return;

    const ua = window.navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);
    const standalone = isStandalone();

    if (standalone) {
      // Uygulama zaten kurulu — sadece bildirimler kapalıysa hatırlat.
      if (pushSupported() && VAPID_PUBLIC_KEY && Notification.permission === 'default') {
        setMode('enable-notifications');
        const timer = window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    if (isIos) {
      setMode('ios-install');
      const timer = window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (isAndroid) {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setMode('android-install');
        window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  function dismiss() {
    markDismissed();
    setOpen(false);
    setMode('none');
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    setOpen(false);
    setMode('none');
  }

  async function handleEnableNotifications() {
    setBusy(true);
    try {
      await requestAndSubscribe(supabase);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
      setOpen(false);
      setMode('none');
    }
  }

  if (mode === 'none' || !open) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
        onClick={dismiss}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90dvh] w-full max-w-[380px] overflow-y-auto rounded-[22px] border border-border bg-card p-5"
        >
          {mode === 'ios-install' && (
            <>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span>📲</span> RC Atölyesi&apos;ni Uygulama Gibi Kullan
                </h3>
                <button onClick={dismiss} aria-label="Kapat" className="text-xl text-muted">
                  ✕
                </button>
              </div>
              <p className="mb-4 text-[13px] text-muted">
                Ana ekranına eklersen tarayıcı açmadan, tek dokunuşla girip bildirim alabilirsin.
              </p>

              <ol className="space-y-4 text-sm text-zinc-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                    1
                  </span>
                  <span>
                    Tarayıcının alt (veya üst) çubuğunda bulunan{' '}
                    <span className="font-bold text-white">Paylaş</span> simgesine dokun (kare içinde yukarı ok{' '}
                    <span aria-hidden>⬆️</span> ikonu).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                    2
                  </span>
                  <span>
                    Açılan listede aşağı kaydır, <span className="font-bold text-white">&quot;Ana Ekrana Ekle&quot;</span>{' '}
                    seçeneğini bul ve dokun.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                    3
                  </span>
                  <span>
                    Sağ üstteki <span className="font-bold text-white">&quot;Ekle&quot;</span> düğmesine bas. RC
                    Atölyesi artık ana ekranında bir uygulama simgesi olarak duracak.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                    4
                  </span>
                  <span>
                    O simgeden açtıktan sonra Profil sayfasından{' '}
                    <span className="font-bold text-white">&quot;Bildirimleri Aç&quot;</span>a basarsan, mesaj ve
                    cevap geldiğinde haberin olur.
                  </span>
                </li>
              </ol>

              <button
                onClick={dismiss}
                className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-bold text-black"
              >
                Anladım
              </button>
            </>
          )}

          {mode === 'android-install' && (
            <>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span>⬇️</span> RC Atölyesi&apos;ni Uygulama Olarak Yükle
                </h3>
                <button onClick={dismiss} aria-label="Kapat" className="text-xl text-muted">
                  ✕
                </button>
              </div>
              <p className="mb-5 text-[13px] text-muted">
                Ana ekranına eklersen tarayıcı açmadan, tek dokunuşla girip bildirim alabilirsin. Aşağıdaki
                düğmeyle hemen kurabilirsin.
              </p>

              <button
                onClick={handleAndroidInstall}
                className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-black"
              >
                Şimdi Yükle
              </button>
              <button onClick={dismiss} className="mt-2.5 w-full py-2 text-sm font-semibold text-muted">
                Daha Sonra
              </button>
            </>
          )}

          {mode === 'enable-notifications' && (
            <>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span>🔔</span> Bildirimleri Aç
                </h3>
                <button onClick={dismiss} aria-label="Kapat" className="text-xl text-muted">
                  ✕
                </button>
              </div>
              <p className="mb-5 text-[13px] text-muted">
                Sorularına cevap geldiğinde, mesaj aldığında ya da ilanınla ilgili bir hareket olduğunda haberin
                olsun.
              </p>

              <button
                onClick={handleEnableNotifications}
                disabled={busy}
                className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-black disabled:opacity-60"
              >
                {busy ? 'Açılıyor...' : 'Bildirimleri Aç'}
              </button>
              <button onClick={dismiss} className="mt-2.5 w-full py-2 text-sm font-semibold text-muted">
                Daha Sonra
              </button>
            </>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
