'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GarageCarModal from '@/components/GarageCarModal';
import GarageCarCard from '@/components/GarageCarCard';
import AuthModal from '@/components/AuthModal';
import AvatarUpload from '@/components/AvatarUpload';
import PushSubscribe from '@/components/PushSubscribe';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [problemCount, setProblemCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [cars, setCars] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(
    async (uid: string) => {
      const [{ data: profile }, { data: garageCars }, { count }, { count: followers }, { count: followingC }] =
        await Promise.all([
          supabase.from('profiles').select('username, avatar_url').eq('id', uid).single(),
          supabase
            .from('garage_cars')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false }),
          supabase
            .from('problems')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', uid),
          supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', uid),
          supabase.from('follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', uid)
        ]);

      setUsername(profile?.username ?? '');
      setAvatarUrl(profile?.avatar_url ?? null);
      setCars(garageCars ?? []);
      setProblemCount(count ?? 0);
      setFollowerCount(followers ?? 0);
      setFollowingCount(followingC ?? 0);
    },
    [supabase]
  );

  async function handleAvatarChange(url: string) {
    setAvatarUrl(url);
    if (userId) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
    }
  }

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
        {userId && (
          <AvatarUpload userId={userId} value={avatarUrl} name={username} onChange={handleAvatarChange} />
        )}
        <div>
          <h2 className="text-[23px] font-bold">{username || 'RC Atölyesi üyesi'}</h2>
          <p className="text-muted">RC Atölyesi üyesi</p>
        </div>
      </div>

      <div className="my-5 grid grid-cols-4 gap-2 rounded-2xl bg-cardAlt px-2 py-[18px]">
        <Stat value={problemCount} label="Sorun" />
        <Stat value={cars.length} label="Araç" />
        <Stat value={followerCount} label="Takipçi" />
        <Stat value={followingCount} label="Takip" />
      </div>

      <PushSubscribe />

      <Link
        href="/uyeler"
        className="mb-2.5 block w-full rounded-xl border border-border bg-cardAlt py-3 text-center text-sm font-bold text-zinc-300"
      >
        👥 Üyeleri Keşfet
      </Link>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-border bg-cardAlt py-3 text-sm font-bold text-zinc-300"
      >
        Çıkış Yap
      </button>

      {ADMIN_USER_ID && userId === ADMIN_USER_ID && (
        <Link
          href="/admin"
          className="mt-2.5 block w-full rounded-xl border border-accent/30 bg-accent/10 py-3 text-center text-sm font-bold text-accent2"
        >
          🛡️ Yönetici Paneli
        </Link>
      )}

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
