import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Problem } from '@/lib/types';
import ProblemCard from '@/components/ProblemCard';
import SearchBox from '@/components/SearchBox';
import CategoryChips from '@/components/CategoryChips';
import VehicleTypeChips from '@/components/VehicleTypeChips';
import HomeHero from '@/components/HomeHero';
import TopHelpers from '@/components/TopHelpers';
import TopSellers from '@/components/TopSellers';
import FeaturedCar from '@/components/FeaturedCar';
import NewItemsBanner from '@/components/NewItemsBanner';
import ContactButton from '@/components/ContactButton';
import HomeStats from '@/components/HomeStats';
import WeeklyShowcase from '@/components/WeeklyShowcase';
import CategoryFollowButton from '@/components/CategoryFollowButton';
import { attachUsernames } from '@/lib/attachUsernames';

export const revalidate = 60;

async function getStats(supabase: ReturnType<typeof createClient>) {
  const [{ count: problemCount }, { count: solvedCount }, { count: listingCount }, { count: memberCount }] =
    await Promise.all([
      supabase.from('problems').select('id', { count: 'exact', head: true }),
      supabase.from('problems').select('id', { count: 'exact', head: true }).eq('status', 'solved'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ]);

  return {
    problemCount: problemCount ?? 0,
    solvedCount: solvedCount ?? 0,
    listingCount: listingCount ?? 0,
    memberCount: memberCount ?? 0
  };
}

export default async function HomePage({
  searchParams
}: {
  searchParams: { q?: string; kategori?: string; tur?: string };
}) {
  const supabase = createClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [stats, { data: topHelpers }, { data: featuredCars }, { data: topSellersRaw }, { data: bestAnswerRaw }, { data: bestListingRaw }] =
    await Promise.all([
      getStats(supabase),
      supabase.from('top_helpers').select('*').limit(8),
      supabase
        .from('garage_cars')
        .select('id, user_id, brand, model, image_url, like_count')
        .not('image_url', 'is', null)
        .order('like_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1),
      supabase.from('top_sellers').select('*').limit(8),
      supabase
        .from('answers')
        .select('body, like_count, created_at, problems(title, slug), profiles(username)')
        .gt('like_count', 0)
        .gte('created_at', weekAgo)
        .order('like_count', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('listings')
        .select('title, price, image_url, slug, favorite_count, created_at')
        .eq('status', 'active')
        .gt('favorite_count', 0)
        .gte('created_at', weekAgo)
        .order('favorite_count', { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  const bestAnswer = bestAnswerRaw
    ? {
        body: (bestAnswerRaw as any).body,
        like_count: (bestAnswerRaw as any).like_count,
        problem_title: (bestAnswerRaw as any).problems?.title ?? '',
        problem_slug: (bestAnswerRaw as any).problems?.slug ?? '',
        username: (bestAnswerRaw as any).profiles?.username ?? null
      }
    : null;

  const bestListing = bestListingRaw
    ? {
        title: (bestListingRaw as any).title,
        price: (bestListingRaw as any).price,
        image_url: (bestListingRaw as any).image_url,
        slug: (bestListingRaw as any).slug,
        favorite_count: (bestListingRaw as any).favorite_count
      }
    : null;

  const featuredCarWithUsername = await attachUsernames(supabase, featuredCars ?? []);
  const featuredCar = featuredCarWithUsername[0] ?? null;
  const topSellers = await attachUsernames(supabase, topSellersRaw ?? []);

  // "RC Atölyesi Ekibi" hesabı başlangıç içeriğini paylaşmak için
  // oluşturulmuştu — gerçek üyelerin sıralamasında görünmesin.
  const realTopHelpers = (topHelpers ?? []).filter(
    (h: any) => !(h.username || '').toLowerCase().includes('atölyesi ekibi')
  );

  let query = supabase
    .from('problems')
    .select(
      'id, user_id, title, brand, model, category, vehicle_type, description, image_url, status, slug, answer_count, created_at, profiles(username)'
    )
    .order('created_at', { ascending: false })
    .limit(10);

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

  const problems: Problem[] = (data ?? []).map((row: any) => ({
    ...row,
    author_username: row.profiles?.username ?? null
  }));

  return (
    <div>
      <HomeHero />

      <TopSellers sellers={topSellers.map((s: any) => ({ ...s, username: s.author_username }))} />

      <SearchBox />
      <VehicleTypeChips basePath="/" />
      <CategoryChips />
      <CategoryFollowButton />

      <WeeklyShowcase bestAnswer={bestAnswer} bestListing={bestListing} />

      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <h2 className="text-[15px] font-bold text-zinc-300">Son Sorular</h2>
        <Link
          href="/sorun/yeni"
          className="rounded-lg bg-accent/10 px-3 py-1.5 text-[13px] font-bold text-accent2"
        >
          + Yeni Konu Aç
        </Link>
      </div>

      <NewItemsBanner table="problems" />

      {error && (
        <p className="px-4 py-6 text-sm text-red-400">
          Sorular yüklenemedi. Supabase tablosu henüz kurulmamış olabilir.
        </p>
      )}

      {!error && problems.length === 0 && (
        <div className="mx-4 my-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mb-2 text-4xl">🔧</div>
          <h3 className="font-bold">Henüz sorun paylaşılmamış</h3>
          <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted">
            İlk soruyu sen sor, deneyimli RC'ciler yanıtlasın.
          </p>
          <Link
            href="/sorun/yeni"
            className="mt-4 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
          >
            Sorun Sor
          </Link>
        </div>
      )}

      <div>
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>

      <TopHelpers helpers={realTopHelpers} />
      <HomeStats stats={stats} />
      {featuredCar && <FeaturedCar car={featuredCar} />}
      <ContactButton />
    </div>
  );
}
