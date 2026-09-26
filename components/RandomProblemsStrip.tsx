'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Problem } from '@/lib/types';
import ProblemCarouselCard from './ProblemCarouselCard';

const POOL_SIZE = 30;
const SHOW_COUNT = 5;

// Ana sayfadaki "Sorunlar" şeridi. Sunucu tarafı sayfa 60 saniye önbelleğe
// alındığı için (revalidate=60), rastgeleliği sunucuda yapsaydık aynı 60
// saniyelik pencerede herkese aynı 5 soru görünürdü. Bunun yerine bu
// bileşen istemcide, sayfa her açıldığında kendi başına veri çekip
// karıştırıyor — böylece gerçekten her sayfa yüklemesinde değişiyor.
export default function RandomProblemsStrip() {
  const supabase = createClient();
  const [problems, setProblems] = useState<Problem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('problems')
      .select(
        'id, user_id, title, brand, model, category, vehicle_type, description, image_url, status, slug, answer_count, created_at, profiles(username)'
      )
      .order('created_at', { ascending: false })
      .limit(POOL_SIZE)
      .then(({ data }) => {
        if (cancelled) return;

        const pool: Problem[] = (data ?? []).map((row: any) => ({
          ...row,
          author_username: row.profiles?.username ?? null
        }));

        // Fisher-Yates karıştırma, sonra ilk 5'i al.
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        setProblems(pool.slice(0, SHOW_COUNT));
      });

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (problems !== null && problems.length === 0) return null;

  return (
    <section className="pt-2">
      <div className="flex items-center justify-between px-4 pb-1.5">
        <h2 className="text-[15px] font-bold text-zinc-300">🔧 Sorunlar</h2>
        <Link href="/sorular" className="text-[12px] font-semibold text-accent2">
          Tümünü Gör
        </Link>
      </div>

      <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-1">
        {problems === null
          ? Array.from({ length: SHOW_COUNT }).map((_, i) => (
              <div
                key={i}
                className="h-[190px] w-[148px] shrink-0 animate-pulse rounded-2xl bg-cardAlt"
              />
            ))
          : problems.map((problem) => <ProblemCarouselCard key={problem.id} problem={problem} />)}
      </div>
    </section>
  );
}
