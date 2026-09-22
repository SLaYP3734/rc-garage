'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { buildProblemSlug } from '@/lib/slug';
import { CATEGORIES } from '@/lib/types';
import AuthModal from '@/components/AuthModal';

export default function NewProblemPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCheckingAuth(false);
      if (!user) setAuthOpen(true);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!title.trim() || !brand.trim() || !model.trim() || !description.trim()) {
      setMessage('Başlık, marka, model ve açıklama alanları zorunlu.');
      return;
    }

    setSubmitting(true);
    setMessage('Paylaşılıyor...');

    const slug = buildProblemSlug(brand.trim(), model.trim(), title.trim());

    const { data, error } = await supabase
      .from('problems')
      .insert({
        user_id: user.id,
        title: title.trim(),
        brand: brand.trim(),
        model: model.trim(),
        category,
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        slug,
        status: 'open'
      })
      .select('slug')
      .single();

    setSubmitting(false);

    if (error) {
      console.error(error);
      setMessage('Sorun paylaşılamadı. Tekrar deneyelim.');
      return;
    }

    router.push(`/sorun/${data.slug}`);
  }

  if (checkingAuth) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-lg font-bold">🔧 Sorun Sor</h1>
      <p className="mb-5 text-sm text-muted">
        Ne kadar net yazarsan o kadar hızlı ve doğru cevap alırsın.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Marka (Traxxas...)" value={brand} onChange={setBrand} />
          <Input placeholder="Model (Maxx...)" value={model} onChange={setModel} />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <Input
          placeholder="Kısa başlık (örn: Motor 3S'te aşırı ısınıyor)"
          value={title}
          onChange={setTitle}
        />

        <textarea
          placeholder="Sorunu ayrıntılı anlat: ne zaman oluyor, hangi parçalar kullanılıyor, ne denedin..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
        />

        <Input
          placeholder="Fotoğraf linki (opsiyonel)"
          value={imageUrl}
          onChange={setImageUrl}
        />

        <button
          type="submit"
          disabled={submitting}
          className="h-[50px] w-full rounded-xl bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
        >
          {submitting ? 'Paylaşılıyor...' : 'Sorunu Paylaş'}
        </button>

        {message && <p className="text-center text-[13px] text-accent2">{message}</p>}
      </form>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          router.push('/');
        }}
      />
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
    />
  );
}
