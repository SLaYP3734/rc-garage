import Link from 'next/link';
import Image from 'next/image';
import { Listing, CONDITION_LABEL } from '@/lib/types';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/ilan/${listing.slug}`}
      className="group flex gap-3 border-b border-border/70 px-4 py-4 transition hover:bg-cardAlt/40"
    >
      <span
        className="mt-1 w-[3px] shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: brandColor(listing.brand) }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {listing.brand && (
            <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
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
          <span className="font-semibold text-zinc-400">
            {listing.author_username || 'RC Garage üyesi'}
          </span>
          <span>·</span>
          <span>{timeAgo(listing.created_at)}</span>
          <span className="ml-auto text-[13px] font-extrabold text-accent">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>

      {listing.image_url && (
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="68px"
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}
