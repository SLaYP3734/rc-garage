'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { buildBlogSlug } from '@/lib/slug';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

// Blog paylaşım kuralları: yazı çok kısa olmasın ve içinde görsel olsun
// (kapak fotoğrafı bu sayıya dahil değil, yazı içeriğindeki fotoğraflar).
const MIN_CONTENT_CHARS = 300;
const MIN_PHOTO_COUNT = 2;

type ExistingPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content: string;
  published: boolean;
};

// Admin panelindeki "Yeni Yazı" ve "Düzenle" sayfalarının ortak formu.
// existingPost verilirse düzenleme modunda çalışır (slug sabit kalır),
// verilmezse yeni yazı oluşturur (slug başlıktan otomatik üretilir).
export default function BlogPostForm({ existingPost }: { existingPost?: ExistingPost }) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(existingPost?.title ?? '');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(existingPost?.cover_image_url ?? '');
  const [content, setContent] = useState(existingPost?.content ?? '');
  const [published, setPublished] = useState(existingPost?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('Başlık boş olamaz.');
      return;
    }
    if (!content || content === '<p></p>') {
      setError('Yazı içeriği boş olamaz.');
      return;
    }

    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainText.length < MIN_CONTENT_CHARS) {
      setError(`Yazı içeriği çok kısa. En az ${MIN_CONTENT_CHARS} karakter yazmalısın (şu an ${plainText.length}).`);
      return;
    }

    const photoCount = (content.match(/<img\b/g) || []).length;
    if (photoCount < MIN_PHOTO_COUNT) {
      setError(`Yazı içeriğinde en az ${MIN_PHOTO_COUNT} fotoğraf olmalı (şu an ${photoCount}).`);
      return;
    }

    setError('');
    setSaving(true);

    if (existingPost) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          cover_image_url: coverImageUrl || null,
          content,
          published
        })
        .eq('id', existingPost.id);

      setSaving(false);

      if (updateError) {
        setError('Kaydedilemedi: ' + updateError.message);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      const isAdmin = !!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID;

      if (isAdmin) {
        router.push('/admin');
      } else if (published) {
        router.push(`/blog/${existingPost.slug}`);
      } else {
        router.push('/blog');
      }
      router.refresh();
      return;
    } else {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const slug = buildBlogSlug(title.trim());
      const { error: insertError } = await supabase.from('blog_posts').insert({
        slug,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        cover_image_url: coverImageUrl || null,
        content,
        published,
        author_id: user?.id ?? null
      });

      setSaving(false);

      if (insertError) {
        setError('Kaydedilemedi: ' + insertError.message);
        return;
      }

      // Admin her zaman panele döner; içerik üreticisi ise yazısını
      // hemen görebileceği yere (yayınlandıysa yazının kendisine,
      // taslaksa Blog listesine) yönlendirilir.
      const isAdmin = !!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID;
      if (isAdmin) {
        router.push('/admin');
      } else if (published) {
        router.push(`/blog/${slug}`);
      } else {
        router.push('/blog');
      }
      router.refresh();
      return;
    }
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-lg font-bold">{existingPost ? '✏️ Yazıyı Düzenle' : '+ Yeni Blog Yazısı'}</h1>

      <label className="mb-1 block text-[12px] font-semibold text-muted">Başlık</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Örn: Fırçasız Motor Bakımı Nasıl Yapılır?"
        className="mb-4 h-[46px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
      />

      <label className="mb-1 block text-[12px] font-semibold text-muted">Kısa Özet (liste ve Google'da görünür)</label>
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        rows={2}
        placeholder="1-2 cümlelik kısa bir özet..."
        className="mb-4 w-full resize-none rounded-xl border border-border bg-cardAlt px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />

      <label className="mb-1 block text-[12px] font-semibold text-muted">Kapak Fotoğrafı</label>
      <div className="mb-4">
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="📷 Kapak Fotoğrafı Seç" />
      </div>

      <label className="mb-1 block text-[12px] font-semibold text-muted">Yazı İçeriği</label>
      <p className="mb-2 text-[11px] text-mutedDim">
        En az {MIN_CONTENT_CHARS} karakter ve en az {MIN_PHOTO_COUNT} fotoğraf içermeli.
      </p>
      <div className="mb-4">
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <label className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-zinc-200">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Yayınla (işaretlemezsen taslak olarak kalır, sadece sen görürsün)
      </label>

      {error && <p className="mb-3 text-[13px] text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-accent py-3 text-sm font-extrabold text-black disabled:opacity-60"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  );
}
