import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import { badgeForSolvedCount, Listing, GarageCar } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import GarageCarCard from '@/components/GarageCarCard';

export const revalidate = 60;

async function getSellerData(username: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .eq('username', username)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: listings }, { data: cars }, { count: solvedCount }, { count: totalListingCount }] =
    await Promise.all([
      supabase
        .from('listings')
        .select(
          'id, user_id, title, brand, model, category, condition, price, description, image_url, status, slug, created_at'
        )
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('garage_cars')
        .select('id, user_id, brand, model, scale, motor, esc, battery, notes, image_url, like_count, created_at')
        .eq('user_id', profile.id)
        .order('like_count', { ascending: false })
        .limit(6),
      supabase
        .from('answers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_accepted', true),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
    ]);

  return {
    profile,
    listings: ((listings ?? []) as any[]).map((l) => ({ ...l, author_username: profile.username })) as Listing[],
    cars: ((cars ?? []) as any[]).map((c) => ({ ...c, author_username: profile.username })) as GarageCar[],
    solvedCount: solvedCount ?? 0,
    totalListingCount: totalListingCount ?? 0
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

  const { profile, listings, cars, solvedCount, totalListingCount } = data;
  const badge = badgeForSolvedCount(solvedCount);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-[28px] font-extrabold text-black">
          {profile.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold">{profile.username}</h1>
          <p className="text-[12px] text-muted">Üye olalı {timeAgo(profile.created_at)}</p>
          {badge && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent2">
              {badge.icon} {badge.label} · {solvedCount} çözüm
            </span>
          )}
        </div>
      </div>

      <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl bg-cardAlt px-2 py-4">
        <Stat value={totalListingCount} label="Toplam İlan" />
        <Stat value={cars.length} label="Paylaşılan Araç" />
        <Stat value={solvedCount} label="Çözülen Soru" />
      </div>

      <Link
        href={`/mesajlar/${profile.id}`}
        className="block w-full rounded-xl bg-accent py-3 text-center text-sm font-extrabold text-black"
      >
        💬 Mesaj Gönder
      </Link>

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
          <h2 className="mb-3 text-[15px] font-bold">🏎️ Garajından</h2>
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
