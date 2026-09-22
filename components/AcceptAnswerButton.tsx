'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AcceptAnswerButton({
  problemId,
  answerId
}: {
  problemId: string;
  answerId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAsSolved() {
    setLoading(true);

    // Aynı soruya ait diğer yanıtlar "kabul edilmiş" olamaz.
    await supabase.from('answers').update({ is_accepted: false }).eq('problem_id', problemId);
    await supabase.from('answers').update({ is_accepted: true }).eq('id', answerId);
    await supabase.from('problems').update({ status: 'solved' }).eq('id', problemId);

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={markAsSolved}
      disabled={loading}
      className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
    >
      {loading ? 'İşaretleniyor...' : '✓ Çözüm olarak işaretle'}
    </button>
  );
}
