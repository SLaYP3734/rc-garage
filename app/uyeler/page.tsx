'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';

type MemberRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  followerCount: number;
};

// Üyeleri Keşfet sayfası: takip sistemi tek yönlü olduğu (Instagram'daki
// gibi, karşılıklı arkadaşlık isteği yok) için kullanıcıların birbirini
// bulabileceği bir liste gerekiyor. Kullanıcı adına göre arama yapılabiliyor,
// bulunamazsa en çok takipçisi olan üyeler listeleniyor.
export default function MembersPage() {
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMembers(term: string) {
    setLoading(true);

    let query = supabase.from('profiles').select('id, username, avatar_url').limit(30);

    if (term.trim()) {
      query = query.ilike('username', `%${term.trim()}%`);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: profiles } = await query;
    const rows = (profiles ?? []) as any[];

    const ids = rows.map((r) => r.id);
    let followerCountById = new Map<string, number>();

    if (ids.length) {
      const { data: follows } = await supabase.from('follows').select('followed_id').in('followed_id', ids);
      (follows ?? []).forEach((f: any) => {
        followerCountById.set(f.followed_id, (followerCountById.get(f.followed_id) ?? 0) + 1);
      });
    }

    const withCounts = rows.map((r) => ({
      ...r,
      followerCount: followerCountById.get(r.id) ?? 0
    }));

    withCounts.sort((a, b) => b.followerCount - a.followerCount);

    setMembers(withCounts);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-lg font-bold">👥 Üyeleri Keşfet</h1>
      <p className="mb-4 text-sm text-muted">
        RC Atölyesi'ndeki diğer üyeleri bul, profillerine gözat, takip et.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadMembers(search)}
          placeholder="Kullanıcı adına göre ara..."
          className="h-[46px] flex-1 rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={() => loadMembers(search)}
          className="rounded-xl border border-border bg-cardAlt px-4 text-sm font-semibold text-zinc-300"
        >
          Ara
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

      {!loading && members.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">Üye bulunamadı.</p>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
          >
            <Link href={`/satici/${m.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar url={m.avatar_url} name={m.username} size={42} />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-zinc-100">
                  {m.username || 'RC Atölyesi üyesi'}
                </p>
                <p className="text-[11px] text-mutedDim">{m.followerCount} takipçi</p>
              </div>
            </Link>
            <div className="w-[120px] shrink-0">
              <FollowButton targetUserId={m.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
