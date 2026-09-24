'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { pushSupported, isStandalone, requestAndSubscribe, VAPID_PUBLIC_KEY } from '@/lib/pushClient';
import ModalPortal from '@/components/ModalPortal';

const DISMISS_KEY = 'rc-install-banner-dismissed-at';
const DISMISS_DAYS = 1;

function isDismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!dismissedAt) return false;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
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

// Siteye linkle gelen herkese, telefonuna göre en pratik adımı gösteren
// ince bir şerit: iPhone'da "Ana Ekrana Ekle" talimatı, Android'de
// tek dokunuşla kurulum, uygulama zaten kuruluysa da bildirimleri açma
// hatırlatması. Kapatılırsa 7 gün boyunca tekrar çıkmaz.
export default function InstallBanner() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('none');
  const [showIosModal, setShowIosModal] = useState(false);
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
      }
      return;
    }

    if (isIos) {
      setMode('ios-install');
      return;
    }

    if (isAndroid) {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setMode('android-install');
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  function dismiss() {
    markDismissed();
    setMode('none');
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
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
      setMode('none');
    }
  }

  if (mode === 'none') return null;

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-border bg-cardAlt px-4 py-2.5 text-sm">
        {mode === 'ios-install' && (
          <>
            <span className="text-lg">📲</span>
            <span className="flex-1 text-zinc-300">RC Atölyesi&apos;ni uygulama gibi kullan</span>
            <button
              onClick={() => setShowIosModal(true)}
              className="whitespace-nowrap rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-black"
            >
              Nasıl?
            </button>
          </>
        )}

        {mode === 'android-install' && (
          <>
            <span className="text-lg">⬇️</span>
            <span className="flex-1 text-zinc-300">RC Atölyesi&apos;ni uygulama olarak yükle</span>
            <button
              onClick={handleAndroidInstall}
              className="whitespace-nowrap rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-black"
            >
              Yükle
            </button>
          </>
        )}

        {mode === 'enable-notifications' && (
          <>
            <span className="text-lg">🔔</span>
            <span className="flex-1 text-zinc-300">Mesaj ve cevap geldiğinde haberin olsun</span>
            <button
              onClick={handleEnableNotifications}
              disabled={busy}
              className="whitespace-nowrap rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
            >
              {busy ? 'Açılıyor...' : 'Bildirimleri Aç'}
            </button>
          </>
        )}

        <button onClick={dismiss} aria-label="Kapat" className="px-1 text-lg text-muted">
          ✕
        </button>
      </div>

      {showIosModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
            onClick={() => setShowIosModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90dvh] w-full max-w-[380px] overflow-y-auto rounded-[22px] border border-border bg-card p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Ana Ekrana Ekle</h3>
                <button onClick={() => setShowIosModal(false)} className="text-xl text-muted">
                  ✕
                </button>
              </div>

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
                onClick={() => setShowIosModal(false)}
                className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-bold text-black"
              >
                Anladım
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
