'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GarageCarModal from '@/components/GarageCarModal';
import GarageCarCard from '@/components/GarageCarCard';
import AuthModal from '@/components/AuthModal';

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [problemCount, setProblemCount] = useState(0);
  const [cars, setCars] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(
    async (uid: string) => {
      const [{ data: profile }, { data: garageCars }, { count }] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', uid).single(),
        supabase
          .from('garage_cars')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('problems')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
      ]);

      setUsername(profile?.username ?? '');
      setCars(garageCars ?? []);
      setProblemCount(count ?? 0);
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        setAuthOpen(true);
        return;
      }

      setUserId(user.id);
      await loadData(user.id);
      setLoading(false);
    });
  }, [supabase, loadData]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  if (!userId) {
    return (
      <>
        <div className="p-6 text-center text-muted">
          Profilini görmek için giriş yapman gerekiyor.
        </div>
        <AuthModal
          open={authOpen}
          onClose={() => {
            setAuthOpen(false);
            router.push('/');
          }}
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-[18px] pb-10 pt-6">
      <div className="flex items-center gap-[18px]">
        <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-accent text-[34px] font-extrabold">
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <h2 className="text-[23px] font-bold">{username || 'RC Garage üyesi'}</h2>
          <p className="text-muted">RC Garage üyesi</p>
        </div>
      </div>

      <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl bg-cardAlt px-2 py-[18px]">
        <Stat value={problemCount} label="Sorun" />
        <Stat value={cars.length} label="Araç" />
        <Stat value={0} label="Takipçi" />
      </div>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-border bg-cardAlt py-3 text-sm font-bold text-zinc-300"
      >
        Çıkış Yap
      </button>

      <div className="mt-8">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Garajım</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-[9px] bg-accent px-3.5 py-2 text-sm font-bold text-black"
          >
            ＋ Araç Ekle
          </button>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-9 text-center">
            <div className="mb-2.5 text-5xl">🏎️</div>
            <h3 className="font-bold">Garajın henüz boş</h3>
            <p className="mx-auto mb-5 mt-2 max-w-[280px] text-sm text-muted">
              RC araçlarını ekleyerek kendi garajını oluştur.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-[9px] bg-accent px-3.5 py-2.5 text-sm font-bold text-black"
            >
              ＋ İlk Aracını Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cars.map((car) => (
              <GarageCarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && userId && (
        <GarageCarModal
          userId={userId}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await loadData(userId);
          }}
        />
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <strong className="block text-xl">{value}</strong>
      <span className="block text-xs text-muted">{label}</span>
    </div>
  );
}
