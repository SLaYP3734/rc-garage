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
import ListingCard from '@/components/ListingCard';
import ContactButton from '@/components/ContactButton';
import { timeAgo } from '@/lib/time';
import { getCurrentUser } from '@/lib/authUser';
import { nextBadgeProgress } from '@/lib/types';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

type MyProblem = { id: string; title: string; slug: string; status: string; created_at: string };

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
  const [myProblems, setMyProblems] = useState<MyProblem[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [profileTab, setProfileTab] = useState<'garaj' | 'sorular' | 'ilanlar' | 'favoriler'>('garaj');
  const [solvedCount, setSolvedCount] = useState(0);
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);

  const loadData = useCallback(
    async (uid: string) => {
      const [
        { data: profile },
        { data: garageCars },
        { count },
        { count: followers },
        { count: followingC },
        { data: problems },
        { data: listings },
        { count: solved },
        { data: favorites }
      ] = await Promise.all([
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
        supabase.from('follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', uid),
        supabase
          .from('problems')
          .select('id, title, slug, status, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('listings')
          .select(
            'id, user_id, title, brand, model, category, vehicle_type, condition, price, description, image_url, status, slug, created_at'
          )
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_accepted', true),
        supabase
          .from('listing_favorites')
          .select(
            'created_at, listings(id, user_id, title, brand, model, category, vehicle_type, condition, price, description, image_url, status, slug, created_at)'
          )
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
      ]);

      setUsername(profile?.username ?? '');
      setAvatarUrl(profile?.avatar_url ?? null);
      setCars(garageCars ?? []);
      setProblemCount(count ?? 0);
      setFollowerCount(followers ?? 0);
      setFollowingCount(followingC ?? 0);
      setMyProblems((problems ?? []) as MyProblem[]);
      setMyListings(listings ?? []);
      setSolvedCount(solved ?? 0);
      setFavoriteListings(((favorites ?? []) as any[]).map((f) => f.listings).filter(Boolean));
    },
    [supabase]
  );

  const activeListings = myListings.filter((l) => l.status !== 'sold');
  const soldListings = myListings.filter((l) => l.status === 'sold');

  async function handleAvatarChange(url: string) {
    setAvatarUrl(url);
    if (userId) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
    }
  }

  useEffect(() => {
    getCurrentUser(supabase).then(async (user) => {
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

      <BadgeProgressCard solvedCount={solvedCount} />

      <PushSubscribe />

      <Link
        href="/profil/duzenle"
        className="mb-2.5 block w-full rounded-xl border border-border bg-cardAlt py-3 text-center text-sm font-bold text-zinc-300"
      >
        ⚙️ Bilgilerimi Düzenle
      </Link>

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

      <div className="mt-8">
        <div className="mb-4 flex gap-2 border-b border-border">
          {(
            [
              { key: 'garaj', label: `🚗 Garajım (${cars.length})` },
              { key: 'sorular', label: `❓ Sorularım (${myProblems.length})` },
              { key: 'ilanlar', label: `🛒 İlanlarım (${myListings.length})` },
              { key: 'favoriler', label: `★ Favorilerim (${favoriteListings.length})` }
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setProfileTab(t.key)}
              className={`-mb-px border-b-2 px-1 pb-2.5 text-[13px] font-bold ${
                profileTab === t.key ? 'border-accent text-accent2' : 'border-transparent text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {profileTab === 'garaj' && (
          <>
            <div className="mb-3.5 flex items-center justify-end">
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
          </>
        )}

        {profileTab === 'sorular' &&
          (myProblems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-muted">
              Henüz bir soru sormadın.
            </p>
          ) : (
            <div className="space-y-2">
              {myProblems.map((p) => (
                <Link
                  key={p.id}
                  href={`/sorun/${p.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-zinc-200">
                    {p.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-mutedDim">{timeAgo(p.created_at)}</span>
                </Link>
              ))}
            </div>
          ))}

        {profileTab === 'ilanlar' && (
          <>
            <h3 className="mb-2.5 text-[13px] font-bold text-zinc-400">Devam Eden</h3>
            {activeListings.length === 0 ? (
              <p className="mb-6 rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-muted">
                Devam eden bir ilanın yok.
              </p>
            ) : (
              <div className="-mx-[18px] mb-6">
                {activeListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}

            <h3 className="mb-2.5 text-[13px] font-bold text-zinc-400">Satılanlar</h3>
            {soldListings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-muted">
                Henüz satılmış bir ilanın yok.
              </p>
            ) : (
              <div className="-mx-[18px]">
                {soldListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </>
        )}

        {profileTab === 'favoriler' &&
          (favoriteListings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-muted">
              Henüz favorilediğin bir ilan yok. İlan sayfalarındaki ★ butonuyla ekleyebilirsin.
            </p>
          ) : (
            <div className="-mx-[18px]">
              {favoriteListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ))}
      </div>

      <ContactButton buttonLabel="🆘 Yardıma mı ihtiyacın var?" modalTitle="🆘 Yardım İste" />
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

// Rozet sistemini görünür kılmak için: kaç çözümle bulunduğunu ve bir
// sonraki rozete kaç çözüm kaldığını gösteren küçük bir kart.
function BadgeProgressCard({ solvedCount }: { solvedCount: number }) {
  const { current, next } = nextBadgeProgress(solvedCount);

  if (!current && !next) return null;

  return (
    <div className="mb-2.5 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-zinc-200">
          {current ? (
            <>
              {current.icon} {current.label}
            </>
          ) : (
            'Henüz rozetin yok'
          )}
        </span>
        <span className="text-[11px] text-mutedDim">{solvedCount} çözüm</span>
      </div>

      {next && (
        <>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-cardAlt">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${next.progressPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-mutedDim">
            {next.icon} {next.label} rozetine <strong className="text-accent2">{next.remaining} çözüm</strong> kaldı
          </p>
        </>
      )}
    </div>
  );
}
