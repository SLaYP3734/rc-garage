'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/types';

export default function CategoryChips({ basePath = '/sorular' }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('kategori');

  function select(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('kategori', value);
    else params.delete('kategori');
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-3.5 pb-3">
      <button
        onClick={() => select(null)}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
          !active
            ? 'border-accent bg-accent/15 text-accent2'
            : 'border-border text-muted'
        }`}
      >
        Tümü
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => select(c.value)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            active === c.value
              ? 'border-accent bg-accent/15 text-accent2'
              : 'border-border text-muted'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
