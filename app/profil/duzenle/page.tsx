'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/authUser';

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getCurrentUser(supabase).then(async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      setUsername(profile?.username ?? '');
      setFullName(profile?.full_name ?? '');
      setLoading(false);
    });
  }, [supabase, router]);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    if (!username.trim()) {
      setInfoMessage('Kullanıcı adı boş olamaz.');
      return;
    }

    setSavingInfo(true);
    setInfoMessage('Kaydediliyor...');

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), full_name: fullName.trim() || null })
      .eq('id', userId);

    setSavingInfo(false);

    if (error) {
      setInfoMessage(
        error.message?.includes('duplicate') || error.message?.includes('unique')
          ? 'Bu kullanıcı adı zaten alınmış.'
          : 'Kaydedilemedi. Tekrar deneyelim.'
      );
      return;
    }

    setInfoMessage('✓ Bilgilerin güncellendi.');
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      setPasswordMessage('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== newPassword2) {
      setPasswordMessage('Şifreler eşleşmiyor.');
      return;
    }

    setSavingPassword(true);
    setPasswordMessage('Değiştiriliyor...');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPassword(false);

    if (error) {
      setPasswordMessage('Şifre değiştirilemedi: ' + error.message);
      return;
    }

    setNewPassword('');
    setNewPassword2('');
    setPasswordMessage('✓ Şifren değiştirildi.');
  }

  if (loading) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  return (
    <div className="mx-auto max-w-[560px] px-[18px] py-6">
      <h1 className="mb-1 text-lg font-bold">⚙️ Bilgilerimi Düzenle</h1>
      <p className="mb-6 text-sm text-muted">Kullanıcı adını, ad-soyadını veya şifreni buradan güncelleyebilirsin.</p>

      <form onSubmit={handleSaveInfo} className="mb-8 space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-[14px] font-bold text-zinc-300">Profil Bilgileri</h2>

        <div>
          <label className="mb-1 block px-1 text-[11px] font-medium text-mutedDim">Kullanıcı adı</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block px-1 text-[11px] font-medium text-mutedDim">Ad Soyad</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={savingInfo}
          className="h-[48px] w-full rounded-xl bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
        >
          {savingInfo ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
        </button>

        {infoMessage && <p className="text-center text-[13px] text-accent2">{infoMessage}</p>}
      </form>

      <form onSubmit={handleChangePassword} className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-[14px] font-bold text-zinc-300">Şifre Değiştir</h2>

        <input
          type="password"
          placeholder="Yeni şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Yeni şifre (tekrar)"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          className="h-[48px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />

        <button
          type="submit"
          disabled={savingPassword}
          className="h-[48px] w-full rounded-xl bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
        >
          {savingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
        </button>

        {passwordMessage && <p className="text-center text-[13px] text-accent2">{passwordMessage}</p>}
      </form>
    </div>
  );
}
