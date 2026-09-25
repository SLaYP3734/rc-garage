import Link from 'next/link';

// Ana sayfanın en üstündeki karşılama şeridi — hızlı erişim butonları
// (Arıza Çözümleme / Al-Sat / Galeri). Site istatistikleri artık
// sayfanın en altında (bkz. HomeStats).
export default function HomeHero() {
  return (
    <div className="relative overflow-hidden border-b border-border px-4 pb-5 pt-6">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff6a00, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative grid grid-cols-2 gap-2">
        <Link
          href="/sorun/yeni"
          className="flex items-center justify-center rounded-xl bg-accent px-2 py-3 text-center text-[13px] font-extrabold leading-tight text-black"
        >
          🔧 Arıza Çözümleme
        </Link>
        <Link
          href="/al-sat"
          className="flex items-center justify-center rounded-xl border border-border bg-cardAlt px-2 py-3 text-center text-[13px] font-bold leading-tight text-zinc-200"
        >
          🛒 Al / Sat
        </Link>
        <Link
          href="/vitrin"
          className="flex items-center justify-center rounded-xl border border-border bg-cardAlt px-2 py-3 text-center text-[13px] font-bold leading-tight text-zinc-200"
        >
          📸 Galeri
        </Link>
        <Link
          href="/blog"
          className="flex items-center justify-center rounded-xl border border-border bg-cardAlt px-2 py-3 text-center text-[13px] font-bold leading-tight text-zinc-200"
        >
          📖 Blog
        </Link>
      </div>
    </div>
  );
}
