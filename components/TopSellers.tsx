import Link from 'next/link';
import { TopSeller, sellerRank } from '@/lib/types';
import StarRating from '@/components/StarRating';

// "En Güvenilir Satıcılar" — en çok satış yapmış ve en yüksek puan almış
// satıcıları öne çıkarır. TopHelpers'ın (soru-cevap tarafı) Al/Sat
// karşılığı: alıcıya, tıklamadan önce güven veren bir sinyal.
export default function TopSellers({ sellers }: { sellers: TopSeller[] }) {
  if (sellers.length === 0) return null;

  return (
    <div className="border-b border-border px-4 py-4">
      <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-zinc-300">
        🏆 En Güvenilir Satıcılar
      </h2>

      <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-1">
        {sellers.slice(0, 8).map((s) => {
          const rank = sellerRank(s.sold_count, s.avg_rating);
          return (
            <Link
              key={s.user_id}
              href={s.username ? `/satici/${s.username}` : '#'}
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-black">
                {(s.username || '?').charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate text-[11px] font-semibold text-zinc-200">
                {s.username || 'Üye'}
              </span>
              <span className="text-[10px] font-medium text-mutedDim">
                {rank.icon} {s.sold_count} satış
              </span>
              {s.rating_count > 0 && <StarRating value={s.avg_rating} size={10} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
