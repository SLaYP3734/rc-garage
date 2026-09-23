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

const TABS: { key: 'problems' | 'listings' | 'garage_cars'; label: string; icon: string }[] = [
  { key: 'problems', label: 'Sorular', icon: '🔧' },
  { key: 'listings', label: 'İlanlar', icon: '🛒' },
  { key: 'garage_cars', label: 'Garaj Araçları', icon: '🏎️' }
];

// Yönetici paneli: silme yetkisi gerçek güvenliğini Supabase'deki RLS
// politikalarından alıyor (schema-admin.sql) — burası sadece kolay bir
// arayüz. Yani bu sayfayı biri bulsa bile, admin UUID'i doğru
// girilmediği sürece silme işlemi veritabanı tarafında reddedilir.
export default function AdminPage() {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<'problems' | 'listings' | 'garage_cars'>('problems');
  const [rows, setRows] = useState<Row[]>([]);
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
    load();
  }, [isAdmin, tab]);

  async function load() {
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

  async function handleDelete(id: string) {
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
      <p className="mb-4 text-sm text-muted">Kural dışı içerikleri buradan silebilirsin.</p>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
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
      </div>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

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
              onClick={() => handleDelete(row.id)}
              disabled={busyId === row.id}
              className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400 disabled:opacity-50"
            >
              {busyId === row.id ? '...' : '🗑️ Sil'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
