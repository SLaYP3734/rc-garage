import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GarageCar } from '@/lib/types';
import { attachUsernames } from '@/lib/attachUsernames';
import GarageCarCard from '@/components/GarageCarCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'RC Atölyesi topluluğunun paylaştığı araçlar — beğen, ilham al.'
};

export default async function VitrinPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('garage_cars')
    .select('id, user_id, brand, model, scale, motor, esc, battery, notes, image_url, like_count, created_at')
    .order('created_at', { ascending: false })
    .limit(40);

  const cars: GarageCar[] = await attachUsernames(supabase, data ?? []);

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-lg font-bold">📸 Galeri</h1>
      <p className="mb-5 text-sm text-muted">
        Topluluğun paylaştığı araçlar. Beğendiklerine kalp at, kendi aracını{' '}
        <Link href="/profil" className="text-accent2">
          profilinden
        </Link>{' '}
        ekle.
      </p>

      {error && (
        <p className="py-6 text-center text-sm text-red-400">
          Galeri yüklenemedi. Supabase tablosu henüz güncellenmemiş olabilir.
        </p>
      )}

      {!error && cars.length === 0 && (
        <div className="my-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mb-2 text-4xl">🏎️</div>
          <h3 className="font-bold">Galeri henüz boş</h3>
          <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted">
            İlk aracı sen paylaş, topluluk görsün.
          </p>
          <Link
            href="/profil"
            className="mt-4 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
          >
            Aracını Ekle
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {cars.map((car) => (
          <GarageCarCard key={car.id} car={car} showOwner />
        ))}
      </div>
    </div>
  );
}
