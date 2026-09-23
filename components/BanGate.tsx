'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Görünmez bileşen: giriş yapmış kullanıcının kendi profilini dinler.
// Admin panelinden birisi "Yasakla" derse, bu değişiklik Supabase
// Realtime üzerinden anında buraya düşer ve kullanıcı saniyeler içinde
// otomatik çıkış yaptırılır (F5 atmasına gerek yok).
export default function BanGate() {
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function handleBanned() {
      await supabase.auth.signOut();
      alert('Hesabın yönetici tarafından kısıtlandı. Site ile ilgili sorularını "Her Konuda Bizimle İletişime Geçin" üzerinden iletebilirsin.');
      window.location.href = '/';
    }

    async function init() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.is_banned) {
        await handleBanned();
        return;
      }

      channel = supabase
        .channel(`ban-watch-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload: any) => {
            if (payload.new?.is_banned) handleBanned();
          }
        )
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
