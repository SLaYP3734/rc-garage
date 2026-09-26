import Link from 'next/link';
import Image from 'next/image';
import { brandColor } from '@/lib/brand';

type BestAnswer = {
  body: string;
  like_count: number;
  problem_title: string;
  problem_slug: string;
  username: string | null;
} | null;

type BestListing = {
  title: string;
  price: number | null;
  image_url: string | null;
  slug: string;
  favorite_count: number;
} | null;

type BestBlogPost = {
  slug: string;
  title: string;
  cover_image_url: string | null;
  comment_count: number;
} | null;

type FeaturedCar = {
  brand: string;
  model: string;
  image_url: string | null;
  like_count: number;
} | null;

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return 'Fiyat belirtilmemiş';
  return `${new Intl.NumberFormat('tr-TR').format(price)} TL`;
}

// Ana sayfada haftanın en beğenilen cevabını, en çok favorilenen ilanını,
// haftanın öne çıkan galeri aracını ve en çok yorum alan blog yazısını
// gösteren vitrin — hepsi aynı boyutta, alt alta. Dördü de boşsa hiçbir
// şey göstermiyor.
export default function WeeklyShowcase({
  bestAnswer,
  bestListing,
  featuredCar,
  bestBlogPost
}: {
  bestAnswer: BestAnswer;
  bestListing: BestListing;
  featuredCar: FeaturedCar;
  bestBlogPost: BestBlogPost;
}) {
  if (!bestAnswer && !bestListing && !featuredCar && !bestBlogPost) return null;

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {bestAnswer && (
          <Link
            href={`/sorun/${bestAnswer.problem_slug}`}
            className="rounded-2xl border border-accent/25 bg-accent/5 p-3.5"
          >
            <p className="mb-1.5 text-[11px] font-bold text-accent2">👍 Öne Çıkan Sorun — {bestAnswer.like_count} beğeni</p>
            <p className="line-clamp-2 text-[13px] text-zinc-200">{bestAnswer.body}</p>
            <p className="mt-1.5 text-[11px] text-mutedDim">
              {bestAnswer.username || 'RC Atölyesi üyesi'} · {bestAnswer.problem_title}
            </p>
          </Link>
        )}

        {bestListing && (
          <Link
            href={`/ilan/${bestListing.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-3.5"
          >
            {bestListing.image_url && (
              <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-xl border border-border">
                <Image src={bestListing.image_url} alt={bestListing.title} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold text-accent2">★ Haftanın İlanı — {bestListing.favorite_count} favori</p>
              <p className="truncate text-[13px] font-semibold text-zinc-200">{bestListing.title}</p>
              <p className="text-[12px] text-accent">{formatPrice(bestListing.price)}</p>
            </div>
          </Link>
        )}

        {featuredCar && featuredCar.image_url && (
          <Link
            href="/vitrin"
            className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-3.5"
          >
            <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-xl border border-border">
              <Image
                src={featuredCar.image_url}
                alt={`${featuredCar.brand} ${featuredCar.model}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold text-accent2">⭐ Haftanın Aracı — {featuredCar.like_count} beğeni</p>
              <p className="truncate text-[13px] font-semibold text-zinc-200">
                <span style={{ color: brandColor(featuredCar.brand) }}>{featuredCar.brand}</span> {featuredCar.model}
              </p>
            </div>
          </Link>
        )}

        {bestBlogPost && (
          <Link
            href={`/blog/${bestBlogPost.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-3.5"
          >
            {bestBlogPost.cover_image_url && (
              <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-xl border border-border">
                <Image src={bestBlogPost.cover_image_url} alt={bestBlogPost.title} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold text-accent2">
                📖 Öne Çıkan Blog — {bestBlogPost.comment_count} yorum
              </p>
              <p className="truncate text-[13px] font-semibold text-zinc-200">{bestBlogPost.title}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
