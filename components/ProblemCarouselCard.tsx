import Link from 'next/link';
import Image from 'next/image';
import { Problem } from '@/lib/types';
import { brandColor } from '@/lib/brand';

const STATUS_DOT: Record<string, string> = {
  solved: 'bg-emerald-400',
  discussing: 'bg-amber-400',
  open: 'bg-zinc-400'
};

const STATUS_TEXT: Record<string, string> = {
  solved: 'Çözüldü',
  discussing: 'Tartışılıyor',
  open: 'Açık'
};

// Ana sayfadaki yatay kaydırmalı "Son Sorular" şeridi için küçük, dikey
// kart — ProblemCard'ın (liste görünümü) yerine, sabit genişlikte bir
// şeritte yan yana dizilsin diye.
export default function ProblemCarouselCard({ problem }: { problem: Problem }) {
  const color = brandColor(problem.brand);
  const status = problem.status as 'open' | 'discussing' | 'solved';

  return (
    <Link
      href={`/sorun/${problem.slug}`}
      className="group block w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/70">
        {problem.image_url ? (
          <Image
            src={problem.image_url}
            alt={problem.title}
            fill
            sizes="148px"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cardAlt text-2xl">🔧</div>
        )}

        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-zinc-100 backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? STATUS_DOT.open}`} />
          {STATUS_TEXT[status] ?? STATUS_TEXT.open}
        </span>
      </div>

      <div className="p-2.5">
        {problem.brand && (
          <p className="truncate text-[10.5px] font-semibold" style={{ color }}>
            {problem.brand}
            {problem.model ? ` ${problem.model}` : ''}
          </p>
        )}
        <h3 className="line-clamp-2 mt-0.5 text-[12.5px] font-bold leading-snug text-white group-hover:text-accent2">
          {problem.title}
        </h3>
        <p className="mt-1.5 text-[11px] font-semibold text-mutedDim">💬 {problem.answer_count} cevap</p>
      </div>
    </Link>
  );
}
