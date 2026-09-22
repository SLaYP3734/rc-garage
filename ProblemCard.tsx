import Link from 'next/link';
import Image from 'next/image';
import { Problem } from '@/lib/types';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import StatusBadge from './StatusBadge';

// "Atölye Panosu" kartı: ne Instagram'ın büyük fotoğraf ağırlıklı akışı,
// ne de düz metinden ibaret bir forum satırı. Marka rengiyle boyanmış
// sol şerit ve durum rozeti taramayı hızlandırırken, başlık her zaman
// gerçek bir <h3> ve kendi adresine (slug) sahip — bu da Google'ın
// "Traxxas Maxx motoru bozuldu" gibi aramalarda bu kartı doğrudan
// bulabilmesinin temeli.
export default function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      href={`/sorun/${problem.slug}`}
      className="group flex gap-3 border-b border-border/70 px-4 py-4 transition hover:bg-cardAlt/40"
    >
      <span
        className="mt-1 w-[3px] shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: brandColor(problem.brand) }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {problem.brand && (
            <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
              {problem.brand}
              {problem.model ? ` ${problem.model}` : ''}
            </span>
          )}
          <StatusBadge status={problem.status} />
        </div>

        <h3 className="text-[15px] font-bold leading-snug text-white group-hover:text-accent2">
          {problem.title}
        </h3>

        <p className="line-clamp-2 mt-1 text-[13px] leading-relaxed text-muted">
          {problem.description}
        </p>

        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-mutedDim">
          <span className="font-semibold text-zinc-400">
            {problem.author_username || 'RC Garage üyesi'}
          </span>
          <span>·</span>
          <span>{timeAgo(problem.created_at)}</span>
          <span className="ml-auto flex items-center gap-1 font-semibold text-zinc-300">
            💬 {problem.answer_count}
          </span>
        </div>
      </div>

      {problem.image_url && (
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={problem.image_url}
            alt={problem.title}
            fill
            sizes="68px"
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}
