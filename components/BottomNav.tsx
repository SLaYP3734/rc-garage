'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Akış', icon: '⌂' },
  { href: '/sorun/yeni', label: 'Sorun Sor', icon: '＋', primary: true },
  { href: '/profil', label: 'Profil', icon: '👤' }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 grid h-[72px] w-full max-w-app -translate-x-1/2 grid-cols-4 border-t border-border bg-[#121214fa]">
      {items.map((item) => {
        const active = pathname === item.href;

        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl text-black">
                {item.icon}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-xl ${
              active ? 'text-white' : 'text-muted'
            }`}
          >
            {item.icon}
            <small className="text-[10px]">{item.label}</small>
          </Link>
        );
      })}

      <button
        disabled
        title="Yakında"
        className="col-start-4 flex flex-col items-center justify-center gap-1 text-xl text-mutedDim opacity-50"
      >
        🛒
        <small className="text-[10px]">Al / Sat</small>
      </button>
    </nav>
  );
}
