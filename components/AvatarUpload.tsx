'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';

const MAX_SIZE_MB = 5;

// Profil resmi yükleme: daire önizleme + üstüne bindirilmiş küçük
// kamera butonu. Yükleme bitince yeni linki onChange ile dışarı verir,
// veritabanına kaydetmek çağıran bileşenin işi.
export default function AvatarUpload({
  userId,
  value,
  name,
  onChange
}: {
  userId: string;
  value: string | null;
  name?: string | null;
  onChange: (url: string) => void;
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

    setUploading(true);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

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

    onChange(publicUrlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar url={value} name={name} size={82} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-accent text-[13px] disabled:opacity-60"
        >
          {uploading ? '…' : '📷'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
