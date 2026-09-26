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
  author_id: string | null;
};

// Admin her yazıyı düzenleyebilir; "İçerik Üretici" rozetine sahip bir
// kullanıcı ise sadece KENDİ yazısını düzenleyebilir. Yazı RLS sayesinde
// herkese (yayınlanmışsa) görünür olabildiği için, burada ayrıca
// "bu yazı gerçekten bana mı ait" kontrolü yapılıyor — sadece görebilmek,
// düzenleyebilmek anlamına gelmiyor.
export default function EditBlogPostPage() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [post, setPost] = useState<ExistingPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setChecking(false);
        return;
      }

      const isAdmin = !!ADMIN_USER_ID && user.id === ADMIN_USER_ID;

      const { data } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, content, published, author_id')
        .eq('id', id)
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setChecking(false);
        return;
      }

      const isOwner = data.author_id === user.id;
      setAllowed(isAdmin || isOwner);
      setPost(data as ExistingPost);
      setChecking(false);
    });
  }, [supabase, id]);

  if (checking) return <div className="p-6 text-center text-muted">Yükleniyor...</div>;

  if (notFound) {
    return <div className="p-8 text-center text-muted">Yazı bulunamadı.</div>;
  }

  if (!allowed || !post) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        <p>Bu sayfayı görmeye yetkin yok.</p>
      </div>
    );
  }

  return <BlogPostForm existingPost={post} />;
}
