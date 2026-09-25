'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Kullanıcı "Şifremi unuttum" ile e-postasına gelen linke tıklayınca bu
// sayfaya düşer. Supabase, linkteki özel token'ı kullanarak tarayıcıda
// otomatik olarak geçici bir oturum açar (auth.onAuthStateChange ->
// PASSWORD_RECOVERY olayı), biz de burada yeni şifreyi soruyoruz.
export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Sayfa açıldığında link zaten işlenmiş olabilir, oturumu direkt kontrol et.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== password2) {
      setMessage('Şifreler eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    setMessage('Kaydediliyor...');

    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      setMessage('Şifre değiştirilemedi: ' + error.message);
      return;
    }

    setDone(true);
    setMessage('✓ Şifren değiştirildi! Şimdi yeni şifrenle giriş yapabilirsin.');
    setTimeout(() => router.push('/'), 2500);
  }

  return (
    <div className="mx-auto max-w-[420px] px-5 py-10 text-center">
      <h1 className="mb-2 text-xl font-bold">🔑 Yeni Şifre Belirle</h1>

      {!ready ? (
        <p className="text-sm text-muted">
          Link kontrol ediliyor... Eğer bir süre sonra hiçbir şey olmazsa, e-postandaki linke tekrar tıkla.
        </p>
      ) : done ? (
        <p className="text-sm text-accent2">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
          <input
            type="password"
            placeholder="Yeni şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Yeni şifre (tekrar)"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-[50px] w-full rounded-xl bg-accent text-base font-extrabold disabled:opacity-60"
          >
            {submitting ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
          </button>
          {message && <p className="text-center text-[13px] text-accent2">{message}</p>}
        </form>
      )}
    </div>
  );
}
