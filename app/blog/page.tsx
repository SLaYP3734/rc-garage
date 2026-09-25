import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'RC araçlarla ilgili bakım rehberleri, teknik ipuçları ve haberler.'
};

type PostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string;
};

async function getPosts(): Promise<PostRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, cover_image_url, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50);

  return (data ?? []) as PostRow[];
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-xl font-extrabold">📖 Blog</h1>
      <p className="mb-5 text-[13px] text-muted">RC araçlarla ilgili bakım rehberleri ve teknik yazılar.</p>

      {posts.length === 0 && (
        <div className="mx-auto my-12 max-w-[280px] text-center">
          <div className="mb-2 text-4xl">📝</div>
          <h3 className="font-bold">Henüz yazı yok</h3>
          <p className="mt-1 text-sm text-muted">Yakında burada bakım rehberleri ve teknik yazılar olacak.</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3"
          >
            {post.cover_image_url && (
              <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-xl border border-border">
                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-[14.5px] font-bold text-zinc-100">{post.title}</h2>
              {post.excerpt && <p className="line-clamp-2 mt-1 text-[12.5px] text-muted">{post.excerpt}</p>}
              <p className="mt-1.5 text-[11px] text-mutedDim">{timeAgo(post.created_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
