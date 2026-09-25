'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { createClient } from '@/lib/supabase/client';

const MAX_IMAGE_MB = 5;

// Admin panelindeki blog yazısı editörü. Kalın/italik, başlık, liste,
// link ve araya fotoğraf ekleme destekliyor. İçerik HTML olarak
// tutuluyor (blog_posts.content) ve yazı sayfasında olduğu gibi basılıyor.
export default function RichTextEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Yazına buradan başla...' })
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  // Dışarıdan (örn. düzenlenecek yazı yüklendiğinde) gelen içerik editöre
  // henüz işlenmemişse senkronize et.
  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== undefined) {
      // Sonsuz döngüye girmemek için sadece gerçekten farklıysa güncelle.
      const current = editor.getHTML();
      if (current === '<p></p>' && value) {
        editor.commands.setContent(value, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Sadece fotoğraf dosyası yükleyebilirsin.');
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Dosya çok büyük (maksimum ${MAX_IMAGE_MB} MB).`);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Fotoğraf yüklemek için giriş yapmalısın.');
      return;
    }

    setUploading(true);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('rc-garage-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error(uploadError);
      setError('Yükleme başarısız oldu. Tekrar deneyelim.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('rc-garage-images').getPublicUrl(path);

    editor.chain().focus().setImage({ src: publicUrlData.publicUrl }).run();
    setUploading(false);
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Bağlantı adresi:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) {
    return <div className="rounded-xl border border-border bg-cardAlt p-4 text-sm text-muted">Editör yükleniyor...</div>;
  }

  const btnClass = (active: boolean) =>
    `rounded-lg border px-2.5 py-1.5 text-[12px] font-bold ${
      active ? 'border-accent/40 bg-accent/15 text-accent2' : 'border-border bg-cardAlt text-zinc-300'
    }`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
          Kalın
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
          İtalik
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
        >
          Başlık
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
        >
          Alt Başlık
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
        >
          1. Liste
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
        >
          Alıntı
        </button>
        <button type="button" onClick={setLink} className={btnClass(editor.isActive('link'))}>
          🔗 Bağlantı
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-border bg-cardAlt px-2.5 py-1.5 text-[12px] font-bold text-zinc-300 disabled:opacity-60"
        >
          {uploading ? 'Yükleniyor...' : '📷 Fotoğraf Ekle'}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />

      {error && <p className="mb-2 text-[12px] text-red-400">{error}</p>}

      <div className="blog-editor rounded-xl border border-border bg-cardAlt px-3.5 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
