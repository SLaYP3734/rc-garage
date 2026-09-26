import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import { CONDITION_LABEL, LISTING_CATEGORIES, badgeForSolvedCount, sellerRank } from '@/lib/types';
import MarkSoldButton from '@/components/MarkSoldButton';
import FavoriteButton from '@/components/FavoriteButton';
import Avatar from '@/components/Avatar';
import StarRating from '@/components/StarRating';
import RateSellerForm from '@/components/RateSellerForm';
import ListingOffers from '@/components/ListingOffers';
import ListingQA from '@/components/ListingQA';

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

async function getListing(slug: string) {
  const supabase = createClient();

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, user_id, title, brand, model, category, condition, price, description, image_url, image_urls, status, slug, created_at, min_offer_amount, profiles(username, avatar_url, is_verified)'
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
  const galleryImages: string[] =
    (listing as any).image_urls && (listing as any).image_urls.length > 0
      ? (listing as any).image_urls
      : listing.image_url
      ? [listing.image_url]
      : [];
  const isOwner = user?.id === listing.user_id;
  const sellerUsername = (listing as any).profiles?.username as string | null;
  const sellerAvatarUrl = (listing as any).profiles?.avatar_url as string | null;
  const sellerIsVerified = (listing as any).profiles?.is_verified as boolean | null;

  let sellerInfo: { createdAt: string; solvedCount: number; listingCount: number } | null = null;
  let sellerRatingStats: { avg_rating: number; rating_count: number } | null = null;
  let soldCount = 0;
  if (sellerUsername) {
    const [{ data: sellerProfile }, { count: solvedCount }, { count: listingCount }, { data: ratingStats }, { count: sold }] =
      await Promise.all([
        supabase.from('profiles').select('created_at').eq('id', listing.user_id).maybeSingle(),
        supabase
          .from('answers')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', listing.user_id)
          .eq('is_accepted', true),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', listing.user_id),
        supabase.from('seller_rating_stats').select('avg_rating, rating_count').eq('seller_id', listing.user_id).maybeSingle(),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', listing.user_id)
          .eq('status', 'sold')
      ]);

    if (sellerProfile) {
      sellerInfo = {
        createdAt: sellerProfile.created_at,
        solvedCount: solvedCount ?? 0,
        listingCount: listingCount ?? 0
      };
    }
    sellerRatingStats = ratingStats ?? { avg_rating: 0, rating_count: 0 };
    soldCount = sold ?? 0;
  }

  const sellerBadge = sellerInfo ? badgeForSolvedCount(sellerInfo.solvedCount) : null;
  const rank = sellerRank(soldCount, sellerRatingStats?.avg_rating ?? 0);

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
          {listing.status === 'sold' ? 'Satıldı' : CONDITION_LABEL[listing.condition as 'yeni' | 'kullanilmis']}
        </span>
      </div>

      <h1 className="text-xl font-extrabold leading-snug">{listing.title}</h1>

      <div className="mt-2 flex items-center gap-2 text-[12px] text-mutedDim">
        {sellerUsername ? (
          <Link href={`/satici/${sellerUsername}`} className="font-semibold text-zinc-400 hover:text-accent2">
            {sellerUsername}
          </Link>
        ) : (
          <span className="font-semibold text-zinc-400">RC Atölyesi üyesi</span>
        )}
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

      {sellerUsername && sellerInfo && (
        <Link
          href={`/satici/${sellerUsername}`}
          className="mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5"
        >
          <Avatar url={sellerAvatarUrl} name={sellerUsername} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-zinc-200">
              {sellerUsername}
              {sellerIsVerified && (
                <span
                  title="Doğrulanmış Satıcı"
                  className="ml-1.5 inline-flex items-center rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-400"
                >
                  ✓ Doğrulanmış
                </span>
              )}
              {sellerBadge && (
                <span className="ml-1.5 text-[11px] font-medium text-accent2">
                  {sellerBadge.icon} {sellerBadge.label}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-mutedDim">
              {rank.icon} {rank.label}
              {sellerRatingStats && sellerRatingStats.rating_count > 0 && (
                <>
                  <StarRating value={sellerRatingStats.avg_rating} size={10} />
                  <span>({sellerRatingStats.rating_count})</span>
                </>
              )}
            </span>
            <span className="block text-[11px] text-mutedDim">
              Üye olalı {timeAgo(sellerInfo.createdAt)} · {sellerInfo.listingCount} ilan
            </span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-accent2">Profili gör →</span>
        </Link>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-2xl font-extrabold text-accent">{formatPrice(listing.price)}</p>
        {!isOwner && <FavoriteButton listingId={listing.id} />}
      </div>

      {galleryImages.length > 0 && (
        <div className="mx-auto mt-4 w-full max-w-[440px]">
          <div className="scrollbar-none flex snap-x snap-mandatory gap-2.5 overflow-x-auto">
            {galleryImages.map((url, index) => (
              <div
                key={url}
                className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden rounded-2xl border border-border"
              >
                <Image src={url} alt={`${listing.title} — fotoğraf ${index + 1}`} fill className="object-cover" />
                {galleryImages.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {index + 1}/{galleryImages.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
        {listing.description}
      </p>

      {isOwner && listing.status !== 'sold' && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/ilan/${listing.slug}/duzenle`}
            className="rounded-lg border border-border bg-cardAlt px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700/40"
          >
            ✏️ Düzenle
          </Link>
          <MarkSoldButton listingId={listing.id} />
        </div>
      )}

      {listing.status === 'sold' && user && !isOwner && (
        <RateSellerForm listingId={listing.id} sellerId={listing.user_id} />
      )}

      {!user && (
        <p className="mt-5 rounded-xl border border-border bg-card p-3.5 text-center text-[13px] text-muted">
          Satıcıya mesaj göndermek için giriş yapmalısın.
        </p>
      )}

      {listing.status !== 'sold' && (
        <ListingOffers
          listingId={listing.id}
          ownerId={listing.user_id}
          minOfferAmount={(listing as any).min_offer_amount ?? null}
        />
      )}

      <ListingQA listingId={listing.id} ownerId={listing.user_id} />
    </article>
  );
}
