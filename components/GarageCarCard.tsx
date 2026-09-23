'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { brandColor } from '@/lib/brand';
import { brandSlug } from '@/lib/slug';
import { GarageCar } from '@/lib/types';

export default function GarageCarCard({
  car,
  showOwner = false
}: {
  car: GarageCar;
  showOwner?: boolean;
}) {
  const supabase = createClient();
  const [likeCount, setLikeCount] = useState(car.like_count);
  const [liked, setLiked] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      setMeId(user.id);

      const { data } = await supabase
        .from('garage_likes')
        .select('id')
        .eq('car_id', car.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cancelled) setLiked(!!data);
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, car.id]);

  async function toggleLike() {
    if (!meId || busy) return;
    setBusy(true);

    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(c - 1, 0));
      await supabase.from('garage_likes').delete().eq('car_id', car.id).eq('user_id', meId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('garage_likes').insert({ car_id: car.id, user_id: meId });
    }

    setBusy(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {car.image_url && (
        <div className="relative h-[160px] w-full">
          <Image src={car.image_url} alt={`${car.brand} ${car.model}`} fill className="object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: brandColor(car.brand) }}
          />
          <Link href={`/marka/${brandSlug(car.brand)}`} className="font-bold hover:text-accent2">
            {car.brand} {car.model}
          </Link>
          {car.scale && <span className="ml-auto text-xs text-mutedDim">{car.scale}</span>}
        </div>

        {showOwner && (
          <p className="mb-1.5 text-[12px] font-semibold text-zinc-400">
            {car.author_username || 'RC Atölyesi üyesi'}
          </p>
        )}

        {(car.motor || car.esc || car.battery) && (
          <p className="text-xs text-muted">
            {[car.motor, car.esc, car.battery].filter(Boolean).join(' · ')}
          </p>
        )}

        {car.notes && <p className="mt-2 text-[13px] text-zinc-300">{car.notes}</p>}

        <button
          onClick={toggleLike}
          disabled={!meId || busy}
          className={`mt-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition ${
            liked
              ? 'border-accent/40 bg-accent/15 text-accent2'
              : 'border-border bg-cardAlt text-muted'
          } disabled:opacity-70`}
        >
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>
      </div>
    </div>
  );
}
