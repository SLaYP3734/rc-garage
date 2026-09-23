'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

// Cloudflare Turnstile — kullanıcıya genelde hiçbir şey göstermeden
// (arkaplanda) gerçek bir insan olduğunu doğrular, deneme123@gmail
// tarzı bot kayıtlarını engellemek için kullanılıyor.
export default function Turnstile({
  onToken,
  resetKey
}: {
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    let cancelled = false;

    function render() {
      const turnstile = (window as any).turnstile;
      if (!ref.current || !turnstile || cancelled) return;

      if (widgetId.current) {
        turnstile.remove(widgetId.current);
      }

      widgetId.current = turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(''),
        'expired-callback': () => onToken('')
      });
    }

    const turnstile = (window as any).turnstile;
    if (turnstile) {
      render();
    } else {
      const interval = setInterval(() => {
        if ((window as any).turnstile) {
          clearInterval(interval);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [resetKey]);

  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div ref={ref} className="flex justify-center" />
    </>
  );
}
