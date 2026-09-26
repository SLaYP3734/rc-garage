import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import ListingSearchBox from '@/components/ListingSearchBox';
import ListingCategoryChips from '@/components/ListingCategoryChips';
import VehicleTypeChips from '@/components/VehicleTypeChips';
import NewItemsBanner from '@/components/NewItemsBanner';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Al / Sat',
  description: 'RC araç, yedek parça ve elektronik ilanları — RC Atölyesi topluluğundan alım satım.'
};

export default async function AlSatPage({
  searchParams
}: {
  searchParams: { q?: string; kategori?: string; tur?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from('listings')
    .select(
      'id, user_id, title, brand, model, category, vehicle_type, condition, price, description, image_url, image_urls, status, slug, created_at, is_featured, profiles(username)'
    )
    .order('status', { ascending: true })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30);

  if (searchParams.kategori) {
    query = query.eq('category', searchParams.kategori);
  }

  if (searchParams.tur) {
    query = query.eq('vehicle_type', searchParams.tur);
  }

  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,brand.ilike.%${searchParams.q}%,model.ilike.%${searchParams.q}%`
    );
  }

  const { data, error } = await query;

  const listings: Listing[] = (data ?? []).map((row: any) => ({
    ...row,
    author_username: row.profiles?.username ?? null
  }));

  return (
    <div>
      <ListingSearchBox />
      <VehicleTypeChips basePath="/al-sat" />
      <ListingCategoryChips />

      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <h1 className="text-[17px] font-bold">Al &amp; Sat</h1>
        <Link href="/ilan/yeni" className="text-[13px] font-semibold text-accent2">
          + Yeni İlan
        </Link>
      </div>

      <NewItemsBanner table="listings" />

      {error && (
        <p className="px-4 py-6 text-sm text-red-400">
          İlanlar yüklenemedi. Supabase tablosu henüz kurulmamış olabilir.
        </p>
      )}

      {!error && listings.length === 0 && (
        <div className="mx-4 my-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mb-2 text-4xl">🛒</div>
          <h3 className="font-bold">Henüz ilan yok</h3>
          <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted">
            İlk ilanı sen ver, topluluk görsün.
          </p>
          <Link
            href="/ilan/yeni"
            className="mt-4 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
          >
            İlan Ver
          </Link>
        </div>
      )}

      <div>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
