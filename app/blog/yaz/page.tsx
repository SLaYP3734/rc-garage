'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import BlogPostForm from '@/components/BlogPostForm';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

// Admin panelinin dışında, "İçerik Üretici" rozeti verilmiş kullanıcıların
// (ve admin'in) kendi blog yazısını ekleyebildiği sayfa.
export default function NewBlogPostByCreatorPage() {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setAllowed(false);
          setChecking(false);
        }
        return;
      }

      if (!!ADMIN_USER_ID && user.id === ADMIN_USER_ID) {
        if (!cancelled) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_content_creator')
        .eq('id', user.id)
        .maybeSingle();

      if (!cancelled) {
        setAllowed(!!profile?.is_content_creator);
        setChecking(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (checking) return <div className="p-6 text-center text-muted">Yükleniyor...</div>;

  if (!allowed) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        <p>Bu sayfayı görmeye yetkin yok.</p>
        <p className="mt-1 text-[12px]">
          Blog'a yazı ekleyebilmek için "İçerik Üretici" rozeti almış olman gerekiyor.
        </p>
      </div>
    );
  }

  return <BlogPostForm />;
}
