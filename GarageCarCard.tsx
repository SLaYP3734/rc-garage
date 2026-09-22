import { brandColor } from '@/lib/brand';

type GarageCar = {
  id: string;
  brand: string;
  model: string;
  scale: string | null;
  motor: string | null;
  esc: string | null;
  battery: string | null;
  notes: string | null;
};

export default function GarageCarCard({ car }: { car: GarageCar }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: brandColor(car.brand) }}
        />
        <h3 className="font-bold">
          {car.brand} {car.model}
        </h3>
        {car.scale && <span className="ml-auto text-xs text-mutedDim">{car.scale}</span>}
      </div>

      {(car.motor || car.esc || car.battery) && (
        <p className="text-xs text-muted">
          {[car.motor, car.esc, car.battery].filter(Boolean).join(' · ')}
        </p>
      )}

      {car.notes && <p className="mt-2 text-[13px] text-zinc-300">{car.notes}</p>}
    </div>
  );
}
