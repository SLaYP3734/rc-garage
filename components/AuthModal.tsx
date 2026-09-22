'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!email || !password) {
      setMessage('E-posta ve şifre alanlarını doldur.');
      return;
    }

    setLoading(true);
    setMessage('İşlem yapılıyor...');

    try {
      if (registerMode) {
        if (!username.trim()) {
          setMessage('Kullanıcı adı gir.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } }
        });

        if (error) throw error;

        setMessage('Kayıt başarılı! Şimdi giriş yapabilirsin.');
        setRegisterMode(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setMessage('Giriş başarılı!');
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 500);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[390px] rounded-[22px] border border-border bg-card p-8 pb-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cardAlt text-xl text-muted hover:text-white"
        >
          ×
        </button>

        <div className="mb-5">
          <strong className="text-2xl tracking-wide">
            <i className="not-italic text-accent">RC</i> GARAGE
          </strong>
        </div>

        <h2 className="text-2xl font-bold">{registerMode ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        <p className="mb-6 mt-2 text-sm text-muted">
          {registerMode ? 'RC Garage ailesine katıl.' : "RC Garage'a hoş geldin."}
        </p>

        <input
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Şifren"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
        />
        {registerMode && (
          <input
            type="text"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-1 h-[51px] w-full rounded-xl bg-accent text-base font-extrabold shadow-lg shadow-accent/20 transition hover:bg-accent2 disabled:opacity-60"
        >
          {registerMode ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>

        <p className="my-3 min-h-[20px] text-[13px] text-accent2">{message}</p>

        <button
          onClick={() => {
            setRegisterMode(!registerMode);
            setMessage('');
          }}
          className="mt-2 p-2 text-sm text-muted hover:text-accent"
        >
          {registerMode ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'}
        </button>
      </div>
    </div>
  );
}
