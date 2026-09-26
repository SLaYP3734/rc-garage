import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import BlogComments from '@/components/BlogComments';

async function getPost(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, cover_image_url, content, published, created_at, author_id, profiles(username, is_content_creator)'
    )
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
  const supabase = createClient();
  const post = await getPost(params.slug);
  if (!post) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const authorUsername = (post as any).profiles?.username as string | null;
  const authorIsCreator = (post as any).profiles?.is_content_creator as boolean | null;
  const canEdit = !!user && (user.id === post.author_id || user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID);

  return (
    <article className="px-4 py-6">
      <h1 className="text-xl font-extrabold leading-snug">{post.title}</h1>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-mutedDim">
        <span>{authorUsername || 'RC Atölyesi Ekibi'}</span>
        {authorIsCreator && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-400">
            ✍️ İçerik Üretici
          </span>
        )}
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
        {canEdit && (
          <>
            <span>·</span>
            <Link href={`/admin/blog/${post.id}/duzenle`} className="font-semibold text-accent2">
              ✏️ Düzenle
            </Link>
          </>
        )}
      </div>

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
