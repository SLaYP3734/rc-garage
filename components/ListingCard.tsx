'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Listing, CONDITION_LABEL } from '@/lib/types';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import AuthorLink from './AuthorLink';

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

// Kartın tamamı tıklanabilir (ilan detayına gider), kullanıcı adı ise
// kendi profiline gitsin diye ayrı bir <a> — bu yüzden kart artık bir
// <Link> değil, tıklamayı kendisi yöneten bir <div> (bkz. ProblemCard).
export default function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const color = brandColor(listing.brand);

  return (
    <div
      onClick={() => router.push(`/ilan/${listing.slug}`)}
      className={`group relative mx-3 mb-2.5 flex cursor-pointer gap-3 overflow-hidden rounded-2xl border px-3.5 py-3.5 transition hover:-translate-y-0.5 hover:bg-cardAlt/70 hover:shadow-lg hover:shadow-black/30 ${
        listing.is_featured
          ? 'border-accent/50 bg-accent/[0.06] hover:border-accent'
          : 'border-border/70 bg-card/60 hover:border-border'
      }`}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] opacity-90 transition-all group-hover:w-[4px]"
        style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
        aria-hidden
      />

      <div className="min-w-0 flex-1 pl-1.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {listing.is_featured && (
            <span className="rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent2">
              ⭐ Öne Çıkan
            </span>
          )}
          {listing.brand && (
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {listing.brand}
              {listing.model ? ` ${listing.model}` : ''}
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
              listing.status === 'sold'
                ? 'border-zinc-500/30 bg-zinc-500/15 text-zinc-400'
                : listing.condition === 'yeni'
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                : 'border-sky-500/30 bg-sky-500/15 text-sky-400'
            }`}
          >
            {listing.status === 'sold'
              ? 'Satıldı'
              : CONDITION_LABEL[listing.condition as 'yeni' | 'kullanilmis']}
          </span>
        </div>

        <h3 className="text-[15px] font-bold leading-snug text-white group-hover:text-accent2">
          {listing.title}
        </h3>

        <p className="line-clamp-2 mt-1 text-[13px] leading-relaxed text-muted">
          {listing.description}
        </p>

        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-mutedDim">
          {listing.author_username ? (
            <AuthorLink
              username={listing.author_username}
              className="font-semibold text-zinc-400 hover:text-accent2"
            />
          ) : (
            <span className="font-semibold text-zinc-400">RC Atölyesi üyesi</span>
          )}
          <span>·</span>
          <span>{timeAgo(listing.created_at)}</span>
          <span className="ml-auto rounded-full bg-cardAlt px-2 py-0.5 text-[12px] font-extrabold text-accent">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>

      {listing.image_url && (
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="76px"
            className="object-cover transition group-hover:scale-105"
          />
          {listing.image_urls && listing.image_urls.length > 1 && (
            <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
              +{listing.image_urls.length - 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
