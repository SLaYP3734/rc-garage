import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brandColor } from '@/lib/brand';
import { timeAgo } from '@/lib/time';
import { CATEGORIES } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import AnswerForm from '@/components/AnswerForm';
import AcceptAnswerButton from '@/components/AcceptAnswerButton';

async function getProblem(slug: string) {
  const supabase = createClient();

  const { data: problem } = await supabase
    .from('problems')
    .select(
      'id, user_id, title, brand, model, category, description, image_url, status, slug, answer_count, created_at, profiles(username)'
    )
    .eq('slug', slug)
    .single();

  return problem;
}

// Google'da "<marka> <model> <arıza>" araması bu sayfaya düşsün diye
// başlık ve açıklama her soruya göre kendi kendine üretiliyor. Bu,
// önceki tek-sayfalık (SPA) yapıda mümkün değildi.
export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const problem = await getProblem(params.slug);

  if (!problem) {
    return { title: 'Sorun bulunamadı' };
  }

  const brandModel = [problem.brand, problem.model].filter(Boolean).join(' ');
  const description = problem.description?.slice(0, 155) ?? undefined;

  return {
    title: `${problem.title}${brandModel ? ` — ${brandModel}` : ''}`,
    description,
    openGraph: {
      title: problem.title,
      description,
      images: problem.image_url ? [problem.image_url] : undefined
    }
  };
}

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const problem = await getProblem(params.slug);

  if (!problem) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: answers } = await supabase
    .from('answers')
    .select('id, problem_id, user_id, body, is_accepted, created_at, profiles(username)')
    .eq('problem_id', problem.id)
    .order('is_accepted', { ascending: false })
    .order('created_at', { ascending: true });

  const categoryLabel = CATEGORIES.find((c) => c.value === problem.category)?.label;
  const isOwner = user?.id === problem.user_id;

  return (
    <article className="px-4 py-5">
      <div
        className="mb-3 h-1 w-14 rounded-full"
        style={{ backgroundColor: brandColor(problem.brand) }}
      />

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {problem.brand && (
          <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
            {problem.brand} {problem.model}
          </span>
        )}
        {categoryLabel && (
          <span className="rounded-md bg-cardAlt px-2 py-0.5 text-[11px] font-semibold text-muted">
            {categoryLabel}
          </span>
        )}
        <StatusBadge status={problem.status} />
      </div>

      {/* Bu H1, Google'ın arama sonucunda göstereceği asıl başlık */}
      <h1 className="text-xl font-extrabold leading-snug">{problem.title}</h1>

      <div className="mt-2 flex items-center gap-2 text-[12px] text-mutedDim">
        <span className="font-semibold text-zinc-400">
          {(problem as any).profiles?.username || 'RC Garage üyesi'}
        </span>
        <span>·</span>
        <span>{timeAgo(problem.created_at)}</span>
      </div>

      {problem.image_url && (
        <div className="relative mt-4 h-[220px] w-full overflow-hidden rounded-2xl border border-border">
          <Image src={problem.image_url} alt={problem.title} fill className="object-cover" />
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
        {problem.description}
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-3 text-[15px] font-bold">
        {answers?.length ? `${answers.length} Yanıt` : 'Henüz yanıt yok'}
      </h2>

      <div className="space-y-4">
        {answers?.map((answer: any) => (
          <div
            key={answer.id}
            className={`rounded-xl border p-3.5 ${
              answer.is_accepted
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="font-semibold text-zinc-300">
                  {answer.profiles?.username || 'RC Garage üyesi'}
                </span>
                <span className="text-mutedDim">{timeAgo(answer.created_at)}</span>
                {answer.is_accepted && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    ✓ Kabul edilen yanıt
                  </span>
                )}
              </div>

              {isOwner && !answer.is_accepted && problem.status !== 'solved' && (
                <AcceptAnswerButton problemId={problem.id} answerId={answer.id} />
              )}
            </div>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-zinc-200">
              {answer.body}
            </p>
          </div>
        ))}
      </div>

      <AnswerForm problemId={problem.id} />
    </article>
  );
}
