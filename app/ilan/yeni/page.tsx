'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { buildListingSlug } from '@/lib/slug';
import { LISTING_CATEGORIES, ListingCondition, VEHICLE_TYPES, VehicleType } from '@/lib/types';
import { getCurrentUser } from '@/lib/authUser';
import AuthModal from '@/components/AuthModal';
import ImageUpload from '@/components/ImageUpload';

export default function NewListingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<string>(LISTING_CATEGORIES[0].value);
  const [vehicleType, setVehicleType] = useState<VehicleType>('araba');
  const [condition, setCondition] = useState<ListingCondition>('kullanilmis');
  const [price, setPrice] = useState('');
  const [minOfferAmount, setMinOfferAmount] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser(supabase).then((user) => {
      setCheckingAuth(false);
      if (!user) setAuthOpen(true);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const user = await getCurrentUser(supabase);

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!title.trim() || !brand.trim() || !model.trim() || !description.trim()) {
      setMessage('Başlık, marka, model ve açıklama alanları zorunlu.');
      return;
    }

    setSubmitting(true);
    setMessage('Yayınlanıyor...');

    const slug = buildListingSlug(brand.trim(), model.trim(), title.trim());
    const parsedPrice = price.trim() ? Number(price.trim().replace(',', '.')) : null;
    const parsedMinOffer = minOfferAmount.trim() ? Number(minOfferAmount.trim().replace(',', '.')) : null;

    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: title.trim(),
        brand: brand.trim(),
        model: model.trim(),
        category,
        vehicle_type: vehicleType,
        condition,
        price: parsedPrice,
        min_offer_amount: parsedMinOffer,
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        slug,
        status: 'active'
      })
      .select('slug')
      .single();

    setSubmitting(false);

    if (error) {
      console.error(error);
      setMessage('İlan yayınlanamadı. Tekrar deneyelim.');
      return;
    }

    router.push(`/ilan/${data.slug}`);
  }

  if (checkingAuth) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-lg font-bold">🛒 Yeni İlan</h1>
      <p className="mb-5 text-sm text-muted">
        Ne kadar net ve doğru bilgi verirsen o kadar hızlı alıcı bulursun.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value as VehicleType)}
          className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        >
          {VEHICLE_TYPES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Marka (Traxxas...)" value={brand} onChange={setBrand} />
          <Input placeholder="Model (Maxx...)" value={model} onChange={setModel} />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        >
          {LISTING_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as ListingCondition)}
            className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          >
            <option value="kullanilmis">İkinci El</option>
            <option value="yeni">Sıfır</option>
          </select>

          <input
            type="number"
            inputMode="decimal"
            placeholder="Fiyat (TL)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Minimum teklif tutarı (TL) — isteğe bağlı"
            value={minOfferAmount}
            onChange={(e) => setMinOfferAmount(e.target.value)}
            className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          />
          <p className="mt-1 px-1 text-[11px] text-mutedDim">
            Belirlersen alıcılar bu tutarın altında teklif veremez. Boş bırakırsan sınır olmaz.
          </p>
        </div>

        <Input
          placeholder="Başlık (örn: Traxxas Maxx komple satılık)"
          value={title}
          onChange={setTitle}
        />

        <textarea
          placeholder="Ürünü ayrıntılı anlat: durumu, kullanım süresi, eksik/fazla parça, takas durumu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
        />

        <ImageUpload value={imageUrl} onChange={setImageUrl} />

        <button
          type="submit"
          disabled={submitting}
          className="h-[50px] w-full rounded-xl bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
        >
          {submitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
        </button>

        {message && <p className="text-center text-[13px] text-accent2">{message}</p>}
      </form>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          router.push('/al-sat');
        }}
      />
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
    />
  );
}
