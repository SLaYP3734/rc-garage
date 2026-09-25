'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlogPostForm from '@/components/BlogPostForm';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

type ExistingPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content: string;
  published: boolean;
};

export default function EditBlogPostPage() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [post, setPost] = useState<ExistingPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const admin = !!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID;
      setIsAdmin(admin);

      if (admin) {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, slug, title, excerpt, cover_image_url, content, published')
          .eq('id', id)
          .maybeSingle();

        if (data) setPost(data as ExistingPost);
        else setNotFound(true);
      }

      setChecking(false);
    });
  }, [supabase, id]);

  if (checking) return <div className="p-6 text-center text-muted">Yükleniyor...</div>;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        <p>Bu sayfayı görmeye yetkin yok.</p>
      </div>
    );
  }

  if (notFound || !post) {
    return <div className="p-8 text-center text-muted">Yazı bulunamadı.</div>;
  }

  return <BlogPostForm existingPost={post} />;
}
