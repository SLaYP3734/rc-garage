import Link from 'next/link';
import Image from 'next/image';
import { brandColor } from '@/lib/brand';

type Car = {
  id: string;
  brand: string;
  model: string;
  image_url: string | null;
  like_count: number;
  author_username?: string | null;
};

// "Haftanın Aracı" — vitrindeki en beğenilen aracı ana sayfada öne
// çıkarır. Siteye her girişte farklı/canlı bir şey görme hissi verir.
export default function FeaturedCar({ car }: { car: Car }) {
  if (!car.image_url) return null;

  return (
    <Link
      href="/vitrin"
      className="group mx-3 mb-3 mt-3 block overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative h-[150px] w-full">
        <Image
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-accent/40 bg-black/50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-accent2 backdrop-blur">
          ⭐ Haftanın Aracı
        </span>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p
              className="text-[11px] font-semibold"
              style={{ color: brandColor(car.brand) }}
            >
              {car.brand}
            </p>
            <h3 className="text-[15px] font-extrabold text-white">{car.model}</h3>
            {car.author_username && (
              <p className="text-[11px] text-zinc-300">{car.author_username}</p>
            )}
          </div>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-bold text-white backdrop-blur">
            ❤️ {car.like_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
