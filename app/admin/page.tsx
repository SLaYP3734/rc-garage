'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/time';

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
  is_verified: boolean;
  created_at: string;
};

type EmailRow = {
  id: string;
  email: string | null;
  username: string | null;
  created_at: string;
};

type ActiveUserRow = {
  id: string;
  username: string | null;
  last_seen_at: string;
};

type VisitorStats = { today: number; week: number; month: number };

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
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
  const [tab, setTab] = useState<
    'problems' | 'listings' | 'garage_cars' | 'users' | 'emails' | 'active' | 'stats' | 'broadcast' | 'blog'
  >('problems');
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [emailsError, setEmailsError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUserRow[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPostRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(!!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID);
      setChecking(false);
    });
  }, [supabase]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users') loadUsers();
    else if (tab === 'emails') loadEmails();
    else if (tab === 'active') loadActiveUsers();
    else if (tab === 'stats') loadVisitorStats();
    else if (tab === 'blog') loadBlogPosts();
    else if (tab === 'broadcast') {
      /* form yeterli, ekstra veri yüklemeye gerek yok */
    } else loadContent();
  }, [isAdmin, tab]);

  async function loadVisitorStats() {
    setLoading(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekAgoStr = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const monthAgoStr = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [{ data: todayRows }, { data: weekRows }, { data: monthRows }] = await Promise.all([
      supabase.from('visitor_days').select('session_id').eq('day', todayStr),
      supabase.from('visitor_days').select('session_id').gte('day', weekAgoStr),
      supabase.from('visitor_days').select('session_id').gte('day', monthAgoStr)
    ]);

    setVisitorStats({
      today: new Set((todayRows ?? []).map((r: any) => r.session_id)).size,
      week: new Set((weekRows ?? []).map((r: any) => r.session_id)).size,
      month: new Set((monthRows ?? []).map((r: any) => r.session_id)).size
    });
    setLoading(false);
  }

  async function sendBroadcast() {
    if (!broadcastText.trim()) return;
    if (!confirm('Bu mesaj TÜM kayıtlı kullanıcılara gönderilecek. Onaylıyor musun?')) return;

    setBroadcasting(true);
    setBroadcastMessage('Gönderiliyor...');

    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', ADMIN_USER_ID);

    if (profilesError || !allProfiles) {
      setBroadcasting(false);
      setBroadcastMessage('Kullanıcı listesi alınamadı: ' + (profilesError?.message ?? ''));
      return;
    }

    const rows = allProfiles.map((p) => ({
      sender_id: ADMIN_USER_ID,
      receiver_id: p.id,
      body: broadcastText.trim()
    }));

    const { error } = await supabase.from('messages').insert(rows);

    setBroadcasting(false);

    if (error) {
      setBroadcastMessage('Gönderilemedi: ' + error.message);
      return;
    }

    setBroadcastMessage(`✓ ${rows.length} kullanıcıya gönderildi.`);
    setBroadcastText('');
  }

  // "Aktif Üyeler" sekmesindeyken listeyi de her 15 saniyede bir tazele.
  useEffect(() => {
    if (!isAdmin || tab !== 'active') return;
    const interval = setInterval(loadActiveUsers, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, tab]);

  async function loadActiveUsers() {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('profiles')
      .select('id, username, last_seen_at')
      .gte('last_seen_at', twoMinAgo)
      .order('last_seen_at', { ascending: false });
    setActiveUsers((data ?? []) as ActiveUserRow[]);
  }

  // Şu an sitede kaç kişi olduğunu (üye/ziyaretçi ayrımı olmadan) her
  // 15 saniyede bir tazele — son 2 dakika içinde "nabız" atan farklı
  // oturum sayısı.
  useEffect(() => {
    if (!isAdmin) return;

    async function loadOnlineCount() {
      const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('live_visitors')
        .select('session_id', { count: 'exact', head: true })
        .gte('last_seen_at', twoMinAgo);
      setOnlineCount(count ?? 0);
    }

    loadOnlineCount();
    const interval = setInterval(loadOnlineCount, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, supabase]);

  async function loadEmails() {
    setLoading(true);
    setEmailsError('');
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        setEmailsError(data?.error || 'E-postalar yüklenemedi.');
        setEmails([]);
      } else {
        setEmails(data.users ?? []);
      }
    } catch (err: any) {
      setEmailsError(err?.message || 'E-postalar yüklenemedi.');
    }
    setLoading(false);
  }

  function copyAllEmails() {
    const list = emails.map((e) => e.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(list).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
      .select('id, username, full_name, is_banned, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userSearch.trim()) {
      query = supabase
        .from('profiles')
        .select('id, username, full_name, is_banned, is_verified, created_at')
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

  async function toggleVerified(user: UserRow) {
    const next = !user.is_verified;
    setBusyId(user.id);
    const { error } = await supabase.rpc('set_verified', { target_id: user.id, verified: next });
    setBusyId(null);

    if (error) {
      alert('İşlem yapılamadı: ' + error.message);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_verified: next } : u)));
  }

  async function loadBlogPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('id, slug, title, published, created_at')
      .order('created_at', { ascending: false });
    setBlogPosts((data ?? []) as BlogPostRow[]);
    setLoading(false);
  }

  async function togglePublished(post: BlogPostRow) {
    setBusyId(post.id);
    const { error } = await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    setBusyId(null);

    if (error) {
      alert('İşlem yapılamadı: ' + error.message);
      return;
    }

    setBlogPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p)));
  }

  async function deleteBlogPost(id: string) {
    if (!confirm('Bu yazıyı kalıcı olarak silmek istediğine emin misin?')) return;
    setBusyId(id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    setBusyId(null);

    if (error) {
      alert('Silinemedi: ' + error.message);
      return;
    }

    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
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
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">🛡️ Yönetici Paneli</h1>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-cardAlt px-3 py-1.5 text-[12px] font-bold text-zinc-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Şu an sitede: {onlineCount === null ? '...' : onlineCount}
        </div>
      </div>
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
        <button
          onClick={() => setTab('emails')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'emails' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          📧 E-postalar
        </button>
        <button
          onClick={() => setTab('active')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'active' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          🟢 Aktif Üyeler
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'stats' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          📊 İstatistik
        </button>
        <button
          onClick={() => setTab('broadcast')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'broadcast' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          📣 Toplu Mesaj
        </button>
        <button
          onClick={() => setTab('blog')}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
            tab === 'blog' ? 'border-accent bg-accent/15 text-accent2' : 'border-border text-muted'
          }`}
        >
          📖 Blog
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

      {tab === 'stats' ? (
        <>
          <p className="mb-3 text-sm text-muted">Farklı kişi sayısı (aynı kişi birden fazla gün gelse tekrar sayılmaz).</p>
          {!visitorStats ? (
            <p className="text-sm text-muted">Yükleniyor...</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <strong className="block text-2xl">{visitorStats.today}</strong>
                <span className="text-[11px] text-muted">Bugün</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <strong className="block text-2xl">{visitorStats.week}</strong>
                <span className="text-[11px] text-muted">Son 7 Gün</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <strong className="block text-2xl">{visitorStats.month}</strong>
                <span className="text-[11px] text-muted">Son 30 Gün</span>
              </div>
            </div>
          )}
        </>
      ) : tab === 'broadcast' ? (
        <>
          <p className="mb-3 text-sm text-muted">
            Buraya yazdığın mesaj TÜM kayıtlı kullanıcıların "Mesajlar" kutusuna admin hesabından düşer (bildirimi
            açık olanlara push bildirimi de gider).
          </p>
          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            rows={5}
            placeholder="Duyurunu yaz..."
            className="w-full resize-y rounded-xl border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={sendBroadcast}
            disabled={broadcasting || !broadcastText.trim()}
            className="mt-3 h-[46px] w-full rounded-xl bg-accent text-sm font-extrabold text-black disabled:opacity-60"
          >
            {broadcasting ? 'Gönderiliyor...' : '📣 Tüm Kullanıcılara Gönder'}
          </button>
          {broadcastMessage && <p className="mt-2 text-center text-[13px] text-accent2">{broadcastMessage}</p>}
        </>
      ) : tab === 'active' ? (
        <>
          <p className="mb-3 text-sm text-muted">
            Son 2 dakika içinde sitede "nabız" atan kayıtlı üyeler (sayfa açıkken otomatik günceller).
          </p>

          {activeUsers.length === 0 && <p className="text-sm text-muted">Şu an aktif üye yok.</p>}

          <div className="space-y-2">
            {activeUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  <p className="truncate text-[13px] font-semibold text-zinc-100">
                    {u.username || 'İsimsiz kullanıcı'}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-mutedDim">{timeAgo(u.last_seen_at)}</span>
              </div>
            ))}
          </div>
        </>
      ) : tab === 'emails' ? (
        <>
          {emailsError && <p className="mb-3 text-sm text-red-400">{emailsError}</p>}

          {!loading && emails.length > 0 && (
            <button
              onClick={copyAllEmails}
              className="mb-3 w-full rounded-xl border border-border bg-cardAlt py-2.5 text-sm font-bold text-zinc-300"
            >
              {copied ? '✓ Kopyalandı' : `📋 Tüm E-postaları Kopyala (${emails.length})`}
            </button>
          )}

          {!loading && emails.length === 0 && !emailsError && (
            <p className="text-sm text-muted">Kayıtlı üye yok.</p>
          )}

          <div className="space-y-2">
            {emails.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-100">
                    {e.username || 'İsimsiz kullanıcı'}
                  </p>
                  <p className="truncate text-[12px] text-mutedDim">{e.email || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : tab === 'blog' ? (
        <>
          <Link
            href="/admin/blog/yeni"
            className="mb-3 block rounded-xl bg-accent px-4 py-3 text-center text-sm font-extrabold text-black"
          >
            + Yeni Yazı
          </Link>

          {!loading && blogPosts.length === 0 && <p className="text-sm text-muted">Henüz yazı yok.</p>}

          <div className="space-y-2">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-100">
                    {post.title}
                    {!post.published && (
                      <span className="ml-1.5 rounded-full bg-zinc-500/15 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">
                        TASLAK
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-mutedDim">{timeAgo(post.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-1.5">
                  <Link
                    href={`/admin/blog/${post.id}/duzenle`}
                    className="rounded-lg border border-border bg-cardAlt px-2.5 py-1.5 text-center text-[11px] font-bold text-zinc-300"
                  >
                    ✏️ Düzenle
                  </Link>
                  <button
                    onClick={() => togglePublished(post)}
                    disabled={busyId === post.id}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                      post.published
                        ? 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {busyId === post.id ? '...' : post.published ? 'Yayından Kaldır' : '✅ Yayınla'}
                  </button>
                  <button
                    onClick={() => deleteBlogPost(post.id)}
                    disabled={busyId === post.id}
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400 disabled:opacity-50"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : tab === 'users' ? (
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
                    {u.is_verified && (
                      <span className="ml-1.5 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
                        ✓ DOĞRULANMIŞ
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-mutedDim">{u.full_name || '—'}</p>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-1.5">
                  <button
                    onClick={() => toggleVerified(u)}
                    disabled={busyId === u.id}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                      u.is_verified
                        ? 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400'
                        : 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                    }`}
                  >
                    {busyId === u.id ? '...' : u.is_verified ? 'Doğrulamayı Kaldır' : '✓ Doğrula'}
                  </button>
                  <button
                    onClick={() => toggleBan(u)}
                    disabled={busyId === u.id || u.id === ADMIN_USER_ID}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                      u.is_banned
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/40 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {busyId === u.id ? '...' : u.is_banned ? '✅ Erişimi Aç' : '🚫 Erişimi Kapat'}
                  </button>
                </div>
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
