'use client';

import { usePathname, useRouter } from 'next/navigation';

// Ana sayfa hariç her sayfada, sol üstte "geri" oku. Tarayıcı geçmişi
// varsa oraya döner, yoksa (linkle direkt açılmışsa) ana sayfaya gider.
export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button
      onClick={goBack}
      aria-label="Geri dön"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cardAlt text-lg text-zinc-300 hover:text-white"
    >
      ←
    </button>
  );
}
