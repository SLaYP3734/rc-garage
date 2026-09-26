import Link from 'next/link';
import Image from 'next/image';
import { brandColor } from '@/lib/brand';

type Car = {
  id: string;
  brand: string;
  model: string;
  image_url: string | null;
  like_count: number;
};

// "Haftanın Aracı" — artık sayfanın en altında tek başına değil, Al-Sat
// şeridinin ilk kartı olarak kayan alanın içinde. Diğer kartlarla aynı
// boyutta ama accent çerçeve ve rozetiyle ayırt ediliyor.
export default function FeaturedCarCard({ car }: { car: Car }) {
  if (!car.image_url) return null;
  const color = brandColor(car.brand);

  return (
    <Link
      href="/vitrin"
      className="group block w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border border-accent/50 bg-accent/[0.06] transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-black/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-accent/30">
        <Image
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="148px"
          className="object-cover transition group-hover:scale-105"
        />
        <span className="absolute left-1.5 top-1.5 rounded-full border border-accent/50 bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-accent2 backdrop-blur">
          ⭐ Haftanın Aracı
        </span>
      </div>

      <div className="p-2.5">
        <p className="truncate text-[10.5px] font-semibold" style={{ color }}>
          {car.brand}
        </p>
        <h3 className="line-clamp-2 mt-0.5 text-[12.5px] font-bold leading-snug text-white group-hover:text-accent2">
          {car.model}
        </h3>
        <p className="mt-1.5 text-[11px] font-semibold text-mutedDim">❤️ {car.like_count}</p>
      </div>
    </Link>
  );
}
