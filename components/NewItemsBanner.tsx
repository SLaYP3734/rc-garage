'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Instagram'daki gibi: birisi yeni bir şey paylaştığında sayfayı F5
// yapmaya gerek kalmadan "Yeniler var" düğmesi belirir. Gerçek zamanlı
// olarak Supabase Realtime'dan tabloya yeni satır eklendiği anda haber
// alır (Supabase panelinde ilgili tabloda Realtime açık olmalı).
export default function NewItemsBanner({ table }: { table: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, () => {
        setHasNew(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table]);

  if (!hasNew) return null;

  return (
    <div className="flex justify-center px-4 pb-2">
      <button
        onClick={() => {
          setHasNew(false);
          router.refresh();
        }}
        className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12.5px] font-bold text-black shadow-lg shadow-black/30 animate-pulse"
      >
        🔄 Yeni paylaşımlar var — Yenile
      </button>
    </div>
  );
}
