import Link from 'next/link';
import Image from 'next/image';
import { Problem, vehicleTypeIcon } from '@/lib/types';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import StatusBadge from './StatusBadge';

// "Atölye Panosu" kartı: ne Instagram'ın büyük fotoğraf ağırlıklı akışı,
// ne de düz metinden ibaret bir forum satırı. Marka rengiyle boyanmış
// sol şerit (ışıltılı) ve durum rozeti taramayı hızlandırırken, başlık
// her zaman gerçek bir <h3> ve kendi adresine (slug) sahip — bu da
// Google'ın "Traxxas Maxx motoru bozuldu" gibi aramalarda bu kartı
// doğrudan bulabilmesinin temeli.
export default function ProblemCard({ problem }: { problem: Problem }) {
  const color = brandColor(problem.brand);

  return (
    <Link
      href={`/sorun/${problem.slug}`}
      className="group relative mx-3 mb-2.5 flex gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/60 px-3.5 py-3.5 transition hover:-translate-y-0.5 hover:border-border hover:bg-cardAlt/70 hover:shadow-lg hover:shadow-black/30"
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] opacity-90 transition-all group-hover:w-[4px]"
        style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
        aria-hidden
      />

      <div className="min-w-0 flex-1 pl-1.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-cardAlt px-1.5 py-0.5 text-[12px]">
            {vehicleTypeIcon(problem.vehicle_type)}
          </span>
          {problem.brand && (
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
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
            {problem.author_username || 'RC Atölyesi üyesi'}
          </span>
          <span>·</span>
          <span>{timeAgo(problem.created_at)}</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-cardAlt px-2 py-0.5 font-semibold text-zinc-300">
            💬 {problem.answer_count}
          </span>
        </div>
      </div>

      {problem.image_url && (
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={problem.image_url}
            alt={problem.title}
            fill
            sizes="76px"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
      )}
    </Link>
  );
}
