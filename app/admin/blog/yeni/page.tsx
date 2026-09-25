'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import BlogPostForm from '@/components/BlogPostForm';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

export default function NewBlogPostPage() {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(!!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID);
      setChecking(false);
    });
  }, [supabase]);

  if (checking) return <div className="p-6 text-center text-muted">Yükleniyor...</div>;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        <p>Bu sayfayı görmeye yetkin yok.</p>
      </div>
    );
  }

  return <BlogPostForm />;
}
