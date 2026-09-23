'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StarRating from '@/components/StarRating';

// İlan "Satıldı" olduğunda, satıcının kendisi hariç giriş yapmış herkese
// gösterilen değerlendirme kutusu. Aynı ilanı bir kişi sadece bir kez
// puanlayabiliyor (veritabanındaki unique kısıt bunu garanti ediyor,
// burada da zaten puanlamışsa formu tekrar göstermiyoruz).
export default function RateSellerForm({
  listingId,
  sellerId
}: {
  listingId: string;
  sellerId: string;
}) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState<{ rating: number; comment: string | null } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setChecking(false);
        return;
      }

      setMeId(user.id);

      const { data } = await supabase
        .from('seller_ratings')
        .select('rating, comment')
        .eq('listing_id', listingId)
        .eq('rater_id', user.id)
        .maybeSingle();

      if (!cancelled) {
        setExisting(data);
        setChecking(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [supabase, listingId]);

  async function handleSubmit() {
    if (!meId || rating === 0) {
      setMessage('Lütfen yıldız seç.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const { error } = await supabase.from('seller_ratings').insert({
      listing_id: listingId,
      seller_id: sellerId,
      rater_id: meId,
      rating,
      comment: comment.trim() || null
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setMessage('Değerlendirme kaydedilemedi. Belki daha önce puan vermişsindir.');
      return;
    }

    setExisting({ rating, comment: comment.trim() || null });
  }

  if (checking || !meId || meId === sellerId) return null;

  if (existing) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
        <p className="mb-1.5 text-[12.5px] font-semibold text-zinc-300">Bu satıcıyı değerlendirdin</p>
        <StarRating value={existing.rating} size={16} />
        {existing.comment && <p className="mt-1.5 text-[13px] text-muted">{existing.comment}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
      <p className="mb-2 text-[12.5px] font-semibold text-zinc-300">⭐ Satıcıyı Değerlendir</p>

      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            className={i <= rating ? 'text-accent' : 'text-zinc-600'}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="İsteğe bağlı kısa yorum..."
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-border bg-cardAlt px-3 py-2 text-[13px] outline-none focus:border-accent"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="mt-2 h-[40px] w-full rounded-lg bg-accent text-[13px] font-bold text-black disabled:opacity-50"
      >
        {submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
      </button>

      {message && <p className="mt-1.5 text-[11px] text-red-400">{message}</p>}
    </div>
  );
}
