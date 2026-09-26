import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/lib/types';
import { brandColor } from '@/lib/brand';

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat yok';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

// Ana sayfadaki yatay kaydırmalı "Al-Sat'tan" şeridi için küçük, dikey
// kart. ListingCard'ın (liste görünümü) yanında, burada resim üstte ve
// kart sabit genişlikte — bir şeride yan yana dizilebilsin diye.
export default function ListingCarouselCard({ listing }: { listing: Listing }) {
  const color = brandColor(listing.brand);

  return (
    <Link
      href={`/ilan/${listing.slug}`}
      className={`group block w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 ${
        listing.is_featured
          ? 'border-accent/50 bg-accent/[0.06] hover:border-accent'
          : 'border-border/70 bg-card/60 hover:border-border'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/70">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="148px"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cardAlt text-2xl">🚗</div>
        )}

        {listing.is_featured && (
          <span className="absolute left-1.5 top-1.5 rounded-full border border-accent/50 bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-accent2 backdrop-blur">
            ⭐ Öne Çıkan
          </span>
        )}

        {listing.status === 'sold' && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-bold text-white">
            Satıldı
          </span>
        )}
      </div>

      <div className="p-2.5">
        {listing.brand && (
          <p className="truncate text-[10.5px] font-semibold" style={{ color }}>
            {listing.brand}
            {listing.model ? ` ${listing.model}` : ''}
          </p>
        )}
        <h3 className="line-clamp-2 mt-0.5 text-[12.5px] font-bold leading-snug text-white group-hover:text-accent2">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-[12px] font-extrabold text-accent">{formatPrice(listing.price)}</p>
      </div>
    </Link>
  );
}
