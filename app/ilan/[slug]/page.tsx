import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import { CONDITION_LABEL, LISTING_CATEGORIES } from '@/lib/types';
import MarkSoldButton from '@/components/MarkSoldButton';

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

async function getListing(slug: string) {
  const supabase = createClient();

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, user_id, title, brand, model, category, condition, price, description, image_url, status, slug, created_at, profiles(username)'
    )
    .eq('slug', slug)
    .single();

  return listing;
}

// Google'da "<marka> <model> satılık" gibi bir arama bu ilana düşsün diye
// başlık ve açıklama her ilana göre kendi kendine üretiliyor.
export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const listing = await getListing(params.slug);

  if (!listing) {
    return { title: 'İlan bulunamadı' };
  }

  const brandModel = [listing.brand, listing.model].filter(Boolean).join(' ');
  const description = listing.description?.slice(0, 155) ?? undefined;

  return {
    title: `${listing.title}${brandModel ? ` — ${brandModel}` : ''} | Al Sat`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.image_url ? [listing.image_url] : undefined
    }
  };
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const listing = await getListing(params.slug);

  if (!listing) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const categoryLabel = LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label;
  const isOwner = user?.id === listing.user_id;

  return (
    <article className="px-4 py-5">
      <div
        className="mb-3 h-1 w-14 rounded-full"
        style={{ backgroundColor: brandColor(listing.brand) }}
      />

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {listing.brand && (
          <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
            {listing.brand} {listing.model}
          </span>
        )}
        {categoryLabel && (
          <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
            {categoryLabel}
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
          {listing.status === 'sold' ? 'Satıldı' : CONDITION_LABEL[listing.condition]}
        </span>
      </div>

      <h1 className="text-xl font-extrabold leading-snug">{listing.title}</h1>

      <div className="mt-2 flex items-center gap-2 text-[12px] text-mutedDim">
        <span className="font-semibold text-zinc-400">
          {(listing as any).profiles?.username || 'RC Garage üyesi'}
        </span>
        <span>·</span>
        <span>{timeAgo(listing.created_at)}</span>
        {!isOwner && user && (
          <>
            <span>·</span>
            <Link href={`/mesajlar/${listing.user_id}`} className="text-accent">
              Satıcıya Mesaj Gönder
            </Link>
          </>
        )}
      </div>

      <p className="mt-3 text-2xl font-extrabold text-accent">{formatPrice(listing.price)}</p>

      {listing.image_url && (
        <div className="relative mt-4 h-[220px] w-full overflow-hidden rounded-2xl border border-border">
          <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
        {listing.description}
      </p>

      {isOwner && listing.status !== 'sold' && (
        <div className="mt-5">
          <MarkSoldButton listingId={listing.id} />
        </div>
      )}

      {!user && (
        <p className="mt-5 rounded-xl border border-border bg-card p-3.5 text-center text-[13px] text-muted">
          Satıcıya mesaj göndermek için giriş yapmalısın.
        </p>
      )}
    </article>
  );
}
