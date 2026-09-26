import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brandSlugToSearchText } from '@/lib/slug';
import { brandColor } from '@/lib/brand';
import { attachUsernames } from '@/lib/attachUsernames';
import { Problem, Listing, GarageCar } from '@/lib/types';
import ProblemCard from '@/components/ProblemCard';
import ListingCard from '@/components/ListingCard';
import GarageCarCard from '@/components/GarageCarCard';

export const revalidate = 60;

async function getBrandData(slug: string) {
  const supabase = createClient();
  const searchText = brandSlugToSearchText(slug);

  const [{ data: problems }, { data: listings }, { data: cars }] = await Promise.all([
    supabase
      .from('problems')
      .select(
        'id, user_id, title, brand, model, category, vehicle_type, description, image_url, status, slug, answer_count, created_at, profiles(username)'
      )
      .ilike('brand', searchText)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('listings')
      .select(
        'id, user_id, title, brand, model, category, vehicle_type, condition, price, description, image_url, image_urls, status, slug, created_at, profiles(username)'
      )
      .ilike('brand', searchText)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('garage_cars')
      .select(
        'id, user_id, brand, model, vehicle_type, scale, motor, esc, battery, notes, image_url, like_count, created_at'
      )
      .ilike('brand', searchText)
      .order('like_count', { ascending: false })
      .limit(20)
  ]);

  const [problemsWithUsername, listingsWithUsername, carsWithUsername] = await Promise.all([
    attachUsernames(supabase, problems ?? []),
    attachUsernames(supabase, listings ?? []),
    attachUsernames(supabase, cars ?? [])
  ]);

  return {
    brandName: problems?.[0]?.brand || listings?.[0]?.brand || cars?.[0]?.brand || searchText,
    problems: problemsWithUsername as Problem[],
    listings: listingsWithUsername as Listing[],
    cars: carsWithUsername as GarageCar[]
  };
}

export async function generateMetadata({
  params
}: {
  params: { brand: string };
}): Promise<Metadata> {
  const { brandName, problems, listings, cars } = await getBrandData(params.brand);

  if (!problems.length && !listings.length && !cars.length) {
    return { title: 'Marka bulunamadı' };
  }

  return {
    title: `${brandName} — Sorular, İlanlar ve Araçlar`,
    description: `${brandName} ile ilgili sorular, ikinci el/sıfır ilanlar ve topluluğun paylaştığı ${brandName} araçları RC Atölyesi'nde.`
  };
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const { brandName, problems, listings, cars } = await getBrandData(params.brand);

  if (!problems.length && !listings.length && !cars.length) notFound();

  const color = brandColor(brandName);

  return (
    <div className="px-4 py-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h1 className="text-xl font-extrabold">{brandName}</h1>
      </div>
      <p className="mb-5 text-sm text-muted">
        {problems.length} soru · {listings.length} ilan · {cars.length} paylaşılan araç
      </p>

      {cars.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 text-[15px] font-bold">🚗 Paylaşılan Araçlar</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cars.map((car) => (
              <GarageCarCard key={car.id} car={car} showOwner />
            ))}
          </div>
        </section>
      )}

      {listings.length > 0 && (
        <section className="mb-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">🛒 İlanlar</h2>
            <Link href="/al-sat" className="text-[12px] font-semibold text-accent2">
              Tüm ilanlar
            </Link>
          </div>
          <div className="-mx-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {problems.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">🔧 Sorular</h2>
            <Link href="/" className="text-[12px] font-semibold text-accent2">
              Tüm sorular
            </Link>
          </div>
          <div className="-mx-4">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
