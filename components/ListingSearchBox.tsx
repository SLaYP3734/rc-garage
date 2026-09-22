'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ListingSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    router.push(`/al-sat?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-3.5 mb-3 mt-4 flex h-[46px] items-center gap-2 rounded-2xl border border-border bg-cardAlt px-3"
    >
      <span className="text-lg text-muted">⌕</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Marka, model veya parça ara..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-mutedDim"
      />
    </form>
  );
}
