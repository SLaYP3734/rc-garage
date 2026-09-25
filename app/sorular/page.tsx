import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Problem } from '@/lib/types';
import ProblemCard from '@/components/ProblemCard';
import SearchBox from '@/components/SearchBox';
import CategoryChips from '@/components/CategoryChips';
import VehicleTypeChips from '@/components/VehicleTypeChips';

export const revalidate = 60;

const PAGE_SIZE = 20;

export const metadata = {
  title: 'Tüm Sorular ve Arızalar — RC Atölyesi',
  description: 'RC Atölyesi topluluğunda paylaşılan tüm sorular ve çözülen arızalar. Marka, model veya sorun ara.'
};

export default async function TumSorularPage({
  searchParams
}: {
  searchParams: { q?: string; kategori?: string; tur?: string; sayfa?: string };
}) {
  const supabase = createClient();

  const page = Math.max(1, parseInt(searchParams.sayfa ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('problems')
    .select(
      'id, user_id, title, brand, model, category, vehicle_type, description, image_url, status, slug, answer_count, created_at, profiles(username)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

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

  const { data, error, count } = await query;

  const problems: Problem[] = (data ?? []).map((row: any) => ({
    ...row,
    author_username: row.profiles?.username ?? null
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.kategori) params.set('kategori', searchParams.kategori);
    if (searchParams.tur) params.set('tur', searchParams.tur);
    if (targetPage > 1) params.set('sayfa', String(targetPage));
    const qs = params.toString();
    return qs ? `/sorular?${qs}` : '/sorular';
  }

  return (
    <div>
      <div className="px-4 pt-5">
        <h1 className="text-xl font-extrabold">🔧 Tüm Sorular</h1>
        <p className="mt-1 text-sm text-muted">
          {totalCount > 0 ? `${totalCount} soru paylaşıldı` : 'Henüz soru paylaşılmadı'}
        </p>
      </div>

      <SearchBox basePath="/sorular" />
      <VehicleTypeChips basePath="/sorular" />
      <CategoryChips basePath="/sorular" />

      {error && (
        <p className="px-4 py-6 text-sm text-red-400">
          Sorular yüklenemedi. Lütfen daha sonra tekrar dene.
        </p>
      )}

      {!error && problems.length === 0 && (
        <div className="mx-4 my-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mb-2 text-4xl">🔧</div>
          <h3 className="font-bold">Aramanla eşleşen soru bulunamadı</h3>
          <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted">
            Filtreleri değiştirmeyi dene ya da ilk soruyu sen sor.
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 px-4 py-6">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-zinc-200"
            >
              ← Önceki
            </Link>
          ) : (
            <span />
          )}

          <span className="text-[13px] text-muted">
            Sayfa {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-zinc-200"
            >
              Sonraki →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
