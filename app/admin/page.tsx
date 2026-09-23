'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

type Row = {
  id: string;
  title?: string;
  brand?: string | null;
  model?: string | null;
  created_at: string;
  author_username?: string | null;
};

type UserRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  is_banned: boolean;
  created_at: string;
};

const CONTENT_TABS: { key: 'problems' | 'listings' | 'garage_cars'; label: string; icon: string }[] = [
  { key: 'problems', label: 'Sorular', icon: '🔧' },
  { key: 'listings', label: 'İlanlar', icon: '🛒' },
  { key: 'garage_cars', label: 'Garaj Araçları', icon: '🏎️' }
];

// Yönetici paneli: silme/yasaklama yetkisinin gerçek güvenliği
// Supabase'deki RLS politikalarından geliyor (schema-admin.sql,
// schema-ban.sql) — burası sadece kolay bir arayüz. Yani bu sayfayı
// biri bulsa bile, admin UUID'i doğru girilmediği sürece işlemler
// veritabanı tarafında reddedilir.
export default function AdminPage() {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<'problems' | 'listings' | 'garage_cars' | 'users'>('problems');
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(!!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID);
      setChecking(false);
    });
  }, [supabase]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users') loadUsers();
    else loadContent();
  }, [isAdmin, tab]);

  async function loadContent() {
    setLoading(true);
    const { data } = await supabase
      .from(tab)
      .select('id, title, brand, model, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    const rowsData = (data ?? []) as any[];
    const userIds = Array.from(new Set(rowsData.map((r) => r.user_id)));
    const { data: profiles } = userIds.length
      ? await supabase.from('profiles').select('id, username').in('id', userIds)
      : { data: [] as any[] };
    const usernameById = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));

    setRows(rowsData.map((r) => ({ ...r, author_username: usernameById.get(r.user_id) ?? null })));
    setLoading(false);
  }

  async function loadUsers() {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('id, username, full_name, is_banned, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userSearch.trim()) {
      query = supabase
        .from('profiles')
        .select('id, username, full_name, is_banned, created_at')
        .ilike('username', `%${userSearch.trim()}%`)
        .limit(50);
    }

    const { data } = await query;
    setUsers((data ?? []) as UserRow[]);
    setLoading(false);
  }

  async function handleDeleteContent(id: string) {
    if (!confirm('Bu kaydı kalıcı olarak silmek istediğine emin misin?')) return;
    setBusyId(id);
    const { error } = await supabase.from(tab).delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function toggleBan(user: UserRow) {
    const next = !user.is_banned;
    if (next && !confirm(`${user.username || 'Bu kullanıcı'} sitedeki erişimini hemen kapatmak istediğine emin misin?`)) {
      return;
    }

    setBusyId(user.id);
    const { error } = await supabase.from('profiles').update({ is_banned: next }).eq('id', user.id);
    setBusyId(null);

    if (error) {
      alert('İşlem yapılamadı: ' + error.message);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_banned: next } : u)));
  }

  if (checking) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        <p>Bu sayfayı görmeye yetkin yok.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-lg font-bold">🛡️ Yönetici Paneli</h1>
      <p className="mb-4 text-sm text-muted">Kural dışı içerikleri sil, gerekirse kullanıcı erişimini kapat.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {CONTENT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
              tab === t.key ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <button
          onClick={() => setTab('users')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'users' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          👥 Kullanıcılar
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

      {tab === 'users' ? (
        <>
          <div className="mb-3 flex gap-2">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              placeholder="Kullanıcı adına göre ara..."
              className="h-[42px] flex-1 rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={loadUsers}
              className="rounded-xl border border-border bg-cardAlt px-4 text-sm font-semibold text-zinc-300"
            >
              Ara
            </button>
          </div>

          {!loading && users.length === 0 && <p className="text-sm text-muted">Kullanıcı bulunamadı.</p>}

          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-100">
                    {u.username || 'İsimsiz kullanıcı'}
                    {u.is_banned && (
                      <span className="ml-1.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                        YASAKLI
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-mutedDim">{u.full_name || '—'}</p>
                </div>
                <button
                  onClick={() => toggleBan(u)}
                  disabled={busyId === u.id || u.id === ADMIN_USER_ID}
                  className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                    u.is_banned
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                >
                  {busyId === u.id ? '...' : u.is_banned ? '✅ Erişimi Aç' : '🚫 Erişimi Kapat'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {!loading && rows.length === 0 && <p className="text-sm text-muted">Kayıt yok.</p>}

          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-100">
                    {row.title || [row.brand, row.model].filter(Boolean).join(' ') || 'Kayıt'}
                  </p>
                  <p className="text-[11px] text-mutedDim">{row.author_username || 'RC Atölyesi üyesi'}</p>
                </div>
                <button
                  onClick={() => handleDeleteContent(row.id)}
                  disabled={busyId === row.id}
                  className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400 disabled:opacity-50"
                >
                  {busyId === row.id ? '...' : '🗑️ Sil'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
