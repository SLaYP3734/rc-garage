'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { VEHICLE_TYPES, VehicleType } from '@/lib/types';

export default function GarageCarModal({
  userId,
  onClose,
  onSaved
}: {
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [vehicleType, setVehicleType] = useState<VehicleType>('araba');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [scale, setScale] = useState('');
  const [motor, setMotor] = useState('');
  const [esc, setEsc] = useState('');
  const [battery, setBattery] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!brand.trim() || !model.trim()) {
      setMessage('Marka ve model zorunlu.');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('garage_cars').insert({
      user_id: userId,
      vehicle_type: vehicleType,
      brand: brand.trim(),
      model: model.trim(),
      scale: scale.trim(),
      motor: motor.trim(),
      esc: esc.trim(),
      battery: battery.trim(),
      notes: notes.trim(),
      image_url: imageUrl.trim() || null
    });

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage('Araç kaydedilemedi. Tekrar deneyelim.');
      return;
    }

    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/78 p-[18px] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-[20px] border border-border bg-card p-7 pb-5">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cardAlt text-xl text-muted hover:text-white"
        >
          ×
        </button>

        <h2 className="mb-1.5 text-xl font-bold">🏎️ Aracını Ekle</h2>
        <p className="mb-5 text-sm text-muted">RC aracının bilgilerini garajına kaydet.</p>

        <div className="space-y-2.5">
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            className="h-12 w-full rounded-[11px] border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
          <Field placeholder="Marka (Traxxas, Arrma...)" value={brand} onChange={setBrand} />
          <Field placeholder="Model (Maxx, Kraton...)" value={model} onChange={setModel} />
          <Field placeholder="Ölçek (1/10, 1/8...)" value={scale} onChange={setScale} />
          <Field placeholder="Motor" value={motor} onChange={setMotor} />
          <Field placeholder="ESC" value={esc} onChange={setEsc} />
          <Field placeholder="Batarya" value={battery} onChange={setBattery} />
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
          <textarea
            placeholder="Araç hakkında notların..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-[11px] border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-3 h-[50px] w-full rounded-[11px] bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor...' : '🚗 Garaja Ekle'}
        </button>

        {message && (
          <p className="mt-2.5 text-center text-[13px] text-accent2">{message}</p>
        )}
      </div>
    </div>
  );
}

function Field({
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
      className="h-12 w-full rounded-[11px] border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
    />
  );
}
