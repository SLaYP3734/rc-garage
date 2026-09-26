'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// Kullanıcıdan kabul edilen ham dosya boyutu sınırı. Bunu çok yükseğe
// çekmiyoruz çünkü asıl çözüm aşağıdaki sıkıştırma — telefon fotoğrafları
// (bazen 10-15MB) otomatik olarak küçültülüp yükleniyor, bu yüzden
// kullanıcının normalde bu sınıra takılması gerekmiyor. Bu sadece çok
// aşırı/bozuk dosyalara karşı bir güvenlik supabı.
const MAX_SIZE_MB = 25;

// Fotoğrafı yüklemeden önce tarayıcıda küçültüp sıkıştırıyoruz:
// - Depolama (Supabase Storage) alanını gereksiz yere doldurmasın
// - Sayfa açılışları/mobil veri kullanımı hızlı kalsın
// - Kullanıcı "5MB sınırı" gibi bir uyarıyla nadiren karşılaşsın,
//   çünkü çoğu telefon fotoğrafı zaten bu adımda birkaç yüz KB'a iner.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
// Zaten küçük/optimize dosyaları tekrar sıkıştırıp kalite kaybetmeye gerek yok.
const SKIP_COMPRESSION_UNDER_BYTES = 350 * 1024;

async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_COMPRESSION_UNDER_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width >= height) {
        height = Math.round((height / width) * MAX_DIMENSION);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width / height) * MAX_DIMENSION);
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    // Sıkıştırma başarısız olursa (eski tarayıcı, bozuk dosya vb.)
    // orijinal dosyayla devam et, yükleme yine de denenebilsin.
    console.error('Fotoğraf sıkıştırılamadı, orijinal yükleniyor:', err);
    return file;
  }
}

export default function ImageUpload({
  value,
  onChange,
  label = '📷 Fotoğraf Seç'
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Sadece fotoğraf dosyası yükleyebilirsin.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Dosya çok büyük (maksimum ${MAX_SIZE_MB} MB).`);
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

    const finalFile = await compressImage(file);

    const ext = finalFile.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('rc-garage-images')
      .upload(path, finalFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error(uploadError);
      setError('Yükleme başarısız oldu. Tekrar deneyelim.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('rc-garage-images').getPublicUrl(path);

    onChange(publicUrlData.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      {value ? (
        <div className="relative h-[140px] w-full overflow-hidden rounded-xl border border-border">
          <Image src={value} alt="Yüklenen fotoğraf" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-[90px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-cardAlt text-sm font-semibold text-muted disabled:opacity-60"
        >
          {uploading ? 'Yükleniyor...' : label}
          {!uploading && (
            <span className="text-[11px] font-normal text-mutedDim">
              Galeriden seç, otomatik yüklensin
            </span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
