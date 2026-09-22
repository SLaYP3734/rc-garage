'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MarkSoldButton({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAsSold() {
    setLoading(true);
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={markAsSold}
      disabled={loading}
      className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
    >
      {loading ? 'İşaretleniyor...' : '✓ Satıldı olarak işaretle'}
    </button>
  );
}
