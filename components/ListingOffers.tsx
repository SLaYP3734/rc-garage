'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/time';
import AuthModal from '@/components/AuthModal';

type OfferRow = {
  id: string;
  buyer_id: string;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  username: string | null;
};

function formatTL(amount: number) {
  return `${new Intl.NumberFormat('tr-TR').format(amount)} TL`;
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: 'Bekliyor', className: 'text-amber-400' },
  accepted: { text: '✓ Kabul Edildi', className: 'text-emerald-400' },
  declined: { text: 'Reddedildi', className: 'text-red-400' }
};

// İlanın altındaki "Teklif Ver" bölümü. Satıcı ilan sahibiyse gelen tüm
// teklifleri görür ve kabul edebilir; başka biri (alıcı) ise sadece
// kendi tekliflerini görür ve yeni teklif verebilir. Minimum teklif
// tutarı belirlenmişse hem burada uyarılır hem de veritabanı (RLS) o
// tutarın altındaki teklifi zaten reddeder.
export default function ListingOffers({
  listingId,
  ownerId,
  minOfferAmount
}: {
  listingId: string;
  ownerId: string;
  minOfferAmount: number | null;
}) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isOwner = meId === ownerId;

  const loadOffers = useCallback(
    async (uid: string | null) => {
      if (!uid) {
        setOffers([]);
        return;
      }

      let query = supabase
        .from('listing_offers')
        .select('id, buyer_id, amount, message, status, created_at, profiles(username)')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false });

      if (uid !== ownerId) {
        query = query.eq('buyer_id', uid);
      }

      const { data } = await query;
      setOffers((data ?? []).map((r: any) => ({ ...r, username: r.profiles?.username ?? null })));
    },
    [supabase, listingId, ownerId]
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setMeId(user?.id ?? null);
      await loadOffers(user?.id ?? null);
      setChecking(false);
    });
  }, [supabase, loadOffers]);

  async function submitOffer() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }

    const parsed = Number(amount.trim().replace(',', '.'));
    if (!parsed || parsed <= 0) {
      setError('Geçerli bir tutar gir.');
      return;
    }
    if (minOfferAmount && parsed < minOfferAmount) {
      setError(`Satıcının belirlediği minimum teklif ${formatTL(minOfferAmount)}.`);
      return;
    }

    setPosting(true);
    setError('');

    const { error: insertError } = await supabase.from('listing_offers').insert({
      listing_id: listingId,
      buyer_id: meId,
      amount: parsed,
      message: message.trim() || null
    });

    setPosting(false);

    if (insertError) {
      setError('Teklif gönderilemedi. Minimum tutarı karşılamıyor olabilir.');
      return;
    }

    setAmount('');
    setMessage('');
    await loadOffers(meId);
  }

  async function acceptOffer(id: string) {
    setBusyId(id);
    const { error: updateError } = await supabase
      .from('listing_offers')
      .update({ status: 'accepted' })
      .eq('id', id);
    setBusyId(null);

    if (!updateError) {
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'accepted' } : o)));
    }
  }

  if (checking) return null;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2.5 text-[15px] font-bold text-zinc-300">💰 Teklif Ver</h2>

      {minOfferAmount && !isOwner && (
        <p className="mb-2.5 text-[12px] text-mutedDim">
          Satıcının kabul ettiği minimum teklif: <strong className="text-accent2">{formatTL(minOfferAmount)}</strong>
        </p>
      )}

      {isOwner ? (
        <>
          {offers.length === 0 && <p className="text-sm text-muted">Henüz teklif gelmedi.</p>}
          <div className="space-y-2">
            {offers.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-cardAlt px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-extrabold text-accent">{formatTL(o.amount)}</p>
                  <p className="truncate text-[12px] text-zinc-300">
                    {o.username || 'RC Atölyesi üyesi'} · {timeAgo(o.created_at)}
                  </p>
                  {o.message && <p className="mt-1 text-[12px] text-mutedDim">{o.message}</p>}
                </div>
                {o.status === 'pending' ? (
                  <button
                    onClick={() => acceptOffer(o.id)}
                    disabled={busyId === o.id}
                    className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 disabled:opacity-50"
                  >
                    {busyId === o.id ? '...' : 'Kabul Et'}
                  </button>
                ) : (
                  <span className={`shrink-0 text-[11px] font-bold ${STATUS_LABEL[o.status].className}`}>
                    {STATUS_LABEL[o.status].text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Teklifin (TL)"
              className="h-[44px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
            />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="İsteğe bağlı not..."
              className="h-[44px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={submitOffer}
              disabled={posting}
              className="h-[46px] w-full rounded-xl bg-accent text-sm font-extrabold text-black disabled:opacity-60"
            >
              {posting ? 'Gönderiliyor...' : 'Teklif Gönder'}
            </button>
            {error && <p className="text-[12px] text-red-400">{error}</p>}
          </div>

          {offers.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase text-mutedDim">Tekliflerin</p>
              {offers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-cardAlt px-3.5 py-2.5"
                >
                  <span className="text-[13.5px] font-bold text-accent">{formatTL(o.amount)}</span>
                  <span className={`text-[11px] font-bold ${STATUS_LABEL[o.status].className}`}>
                    {STATUS_LABEL[o.status].text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
