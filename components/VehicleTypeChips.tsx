'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { VEHICLE_TYPES } from '@/lib/types';

// Araba / Drone / Uçak / Helikopter / Tekne filtre şeridi. Hangi sayfada
// kullanılırsa o sayfanın adresine (basePath) "tur" parametresiyle yönlendirir.
export default function VehicleTypeChips({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('tur');

  function select(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('tur', value);
    else params.delete('tur');
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-3.5 pb-2 pt-3">
      <button
        onClick={() => select(null)}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
          !active ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
        }`}
      >
        Tüm Araçlar
      </button>
      {VEHICLE_TYPES.map((v) => (
        <button
          key={v.value}
          onClick={() => select(v.value)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            active === v.value ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          {v.icon} {v.label}
        </button>
      ))}
    </div>
  );
}
