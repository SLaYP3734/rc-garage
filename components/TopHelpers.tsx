import Link from 'next/link';
import { TopHelper, badgeForSolvedCount } from '@/lib/types';

// "Bu Ayın Yıldızları" — en çok soru çözen (cevabı "çözüm" olarak kabul
// edilen) kullanıcıları öne çıkarır. Deneyimli üyelerin (senin WhatsApp
// grubundaki tanıdıkların gibi) daha çok cevap yazmasını teşvik eden
// hafif bir oyunlaştırma.
export default function TopHelpers({ helpers }: { helpers: TopHelper[] }) {
  if (helpers.length === 0) return null;

  return (
    <div className="border-b border-border px-4 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-zinc-300">
          🏆 Bu Ayın Yıldızları
        </h2>
      </div>

      <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-1">
        {helpers.slice(0, 8).map((h, i) => {
          const badge = badgeForSolvedCount(h.solved_count);
          return (
            <Link
              key={h.user_id}
              href={`/mesajlar/${h.user_id}`}
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-center"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-black">
                {(h.username || '?').charAt(0).toUpperCase()}
                {i < 3 && (
                  <span className="absolute -right-1 -top-1 text-[13px]">
                    {['🥇', '🥈', '🥉'][i]}
                  </span>
                )}
              </div>
              <span className="max-w-[72px] truncate text-[11px] font-semibold text-zinc-200">
                {h.username || 'Üye'}
              </span>
              {badge && (
                <span className="text-[10px] font-medium text-mutedDim">
                  {badge.icon} {h.solved_count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
