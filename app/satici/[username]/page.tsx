import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import { badgeForSolvedCount, sellerRank, Listing, GarageCar, SellerRating } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import GarageCarCard from '@/components/GarageCarCard';
import Avatar from '@/components/Avatar';
import StarRating from '@/components/StarRating';
import FollowButton from '@/components/FollowButton';

export const revalidate = 60;

async function getSellerData(username: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, created_at, is_verified, is_content_creator')
    .eq('username', username)
    .maybeSingle();

  if (!profile) return null;

  const [
    { data: listings },
    { data: cars },
    { count: solvedCount },
    { count: totalListingCount },
    { count: soldCount },
    { data: ratingStats },
    { data: recentRatings },
    { count: followerCount },
    { count: followingCount }
  ] = await Promise.all([
    supabase
      .from('listings')
      .select(
        'id, user_id, title, brand, model, category, vehicle_type, condition, price, description, image_url, status, slug, created_at'
      )
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('garage_cars')
      .select(
        'id, user_id, brand, model, vehicle_type, scale, motor, esc, battery, notes, image_url, like_count, created_at'
      )
      .eq('user_id', profile.id)
      .order('like_count', { ascending: false })
      .limit(6),
    supabase
      .from('answers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_accepted', true),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('status', 'sold'),
    supabase.from('seller_rating_stats').select('avg_rating, rating_count').eq('seller_id', profile.id).maybeSingle(),
    supabase
      .from('seller_ratings')
      .select('id, listing_id, seller_id, rater_id, rating, comment, created_at, profiles!seller_ratings_rater_id_fkey(username)')
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', profile.id),
    supabase.from('follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', profile.id)
  ]);

  return {
    profile,
    listings: ((listings ?? []) as any[]).map((l) => ({ ...l, author_username: profile.username })) as Listing[],
    cars: ((cars ?? []) as any[]).map((c) => ({ ...c, author_username: profile.username })) as GarageCar[],
    solvedCount: solvedCount ?? 0,
    totalListingCount: totalListingCount ?? 0,
    soldCount: soldCount ?? 0,
    ratingStats: ratingStats ?? { avg_rating: 0, rating_count: 0 },
    recentRatings: ((recentRatings ?? []) as any[]).map((r) => ({
      ...r,
      rater_username: r.profiles?.username ?? null
    })) as SellerRating[],
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0
  };
}

export async function generateMetadata({
  params
}: {
  params: { username: string };
}): Promise<Metadata> {
  const data = await getSellerData(params.username);
  if (!data) return { title: 'Kullanıcı bulunamadı' };

  return {
    title: `${data.profile.username} — Satıcı Profili`,
    description: `${data.profile.username} kullanıcısının RC Atölyesi'ndeki ilanları, paylaştığı araçlar ve topluluk geçmişi.`
  };
}

export default async function SellerPage({ params }: { params: { username: string } }) {
  const data = await getSellerData(params.username);
  if (!data) notFound();

  const {
    profile,
    listings,
    cars,
    solvedCount,
    totalListingCount,
    soldCount,
    ratingStats,
    recentRatings,
    followerCount,
    followingCount
  } = data;
  const badge = badgeForSolvedCount(solvedCount);
  const rank = sellerRank(soldCount, ratingStats.avg_rating);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatar_url} name={profile.username} size={72} />
        <div>
          <h1 className="flex items-center gap-1.5 text-[19px] font-extrabold">
            {profile.username}
            {(profile as any).is_verified && (
              <span
                title="Doğrulanmış Satıcı"
                className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-bold text-sky-400"
              >
                ✓
              </span>
            )}
          </h1>
          <p className="text-[12px] text-muted">Üye olalı {timeAgo(profile.created_at)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent2">
              {rank.icon} {rank.label}
            </span>
            {(profile as any).is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold text-sky-400">
                ✓ Doğrulanmış Satıcı
              </span>
            )}
            {(profile as any).is_content_creator && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[11px] font-bold text-violet-400">
                ✍️ İçerik Üretici
              </span>
            )}
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent2">
                {badge.icon} {badge.label} · {solvedCount} çözüm
              </span>
            )}
          </div>
          {ratingStats.rating_count > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <StarRating value={ratingStats.avg_rating} size={13} />
              <span className="text-[11px] text-mutedDim">
                {ratingStats.avg_rating} ({ratingStats.rating_count} değerlendirme)
              </span>
            </div>
          )}
          <p className="mt-1 text-[11px] text-mutedDim">
            <strong className="text-zinc-300">{followerCount}</strong> takipçi ·{' '}
            <strong className="text-zinc-300">{followingCount}</strong> takip edilen
          </p>
        </div>
      </div>

      <div className="my-5 grid grid-cols-4 gap-2 rounded-2xl bg-cardAlt px-2 py-4">
        <Stat value={totalListingCount} label="Toplam İlan" />
        <Stat value={soldCount} label="Satış" />
        <Stat value={cars.length} label="Paylaşılan Araç" />
        <Stat value={solvedCount} label="Çözülen Soru" />
      </div>

      <div className="space-y-2">
        <FollowButton targetUserId={profile.id} />
        <Link
          href={`/mesajlar/${profile.id}`}
          className="block w-full rounded-xl border border-border bg-cardAlt py-3 text-center text-sm font-extrabold text-zinc-200"
        >
          💬 Mesaj Gönder
        </Link>
      </div>

      {listings.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-2 text-[15px] font-bold">🛒 Aktif İlanları</h2>
          <div className="-mx-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {cars.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[15px] font-bold">🚗 Garajından</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cars.map((car) => (
              <GarageCarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}

      {listings.length === 0 && cars.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">
          Bu kullanıcının henüz aktif ilanı veya paylaşılan aracı yok.
        </p>
      )}

      {recentRatings.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[15px] font-bold">💬 Alıcı Yorumları</h2>
          <div className="space-y-2.5">
            {recentRatings.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center gap-2">
                  <StarRating value={r.rating} size={12} />
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {r.rater_username || 'Alıcı'}
                  </span>
                  <span className="ml-auto text-[10px] text-mutedDim">{timeAgo(r.created_at)}</span>
                </div>
                {r.comment && <p className="text-[13px] text-zinc-300">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <strong className="block text-lg">{value}</strong>
      <span className="block text-[11px] text-muted">{label}</span>
    </div>
  );
}
