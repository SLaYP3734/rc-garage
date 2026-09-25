import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import BlogComments from '@/components/BlogComments';

async function getPost(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, content, published, created_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Yazı bulunamadı' };

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="px-4 py-6">
      <h1 className="text-xl font-extrabold leading-snug">{post.title}</h1>
      <p className="mt-1.5 text-[12px] text-mutedDim">{timeAgo(post.created_at)}</p>

      {post.cover_image_url && (
        <div className="relative mt-4 h-[200px] w-full overflow-hidden rounded-2xl border border-border">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="blog-content mt-5" dangerouslySetInnerHTML={{ __html: post.content }} />

      <BlogComments postId={post.id} />
    </article>
  );
}
