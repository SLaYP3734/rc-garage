'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/imageCompress';

const MAX_SIZE_MB = 25;

// İlanlar için çoklu fotoğraf yükleme — en fazla `max` adet fotoğraf,
// ilk fotoğraf otomatik olarak "kapak" fotoğrafı olarak kullanılır
// (listeleme kartlarında görünen budur).
export default function MultiImageUpload({
  value,
  onChange,
  max = 5
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setError('');

    const remainingSlots = max - value.length;
    if (remainingSlots <= 0) {
      setError(`En fazla ${max} fotoğraf ekleyebilirsin.`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Fotoğraf yüklemek için giriş yapmalısın.');
      return;
    }

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setError('Sadece fotoğraf dosyası yükleyebilirsin.');
        continue;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Dosya çok büyük (maksimum ${MAX_SIZE_MB} MB).`);
        continue;
      }

      const finalFile = await compressImage(file);
      const ext = finalFile.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('rc-garage-images')
        .upload(path, finalFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error(uploadError);
        setError('Bir fotoğraf yüklenemedi. Tekrar deneyelim.');
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from('rc-garage-images').getPublicUrl(path);
      uploadedUrls.push(publicUrlData.publicUrl);
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls]);
    }

    setUploading(false);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url, index) => (
          <div key={url} className="relative h-[90px] overflow-hidden rounded-xl border border-border">
            <Image src={url} alt={`Fotoğraf ${index + 1}`} fill className="object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-accent2">
                Kapak
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-[90px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-cardAlt text-[11px] font-semibold text-muted disabled:opacity-60"
          >
            {uploading ? 'Yükleniyor...' : '📷 Ekle'}
          </button>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-mutedDim">
        {value.length}/{max} fotoğraf · İlk fotoğraf kapak olarak kullanılır
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
