'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Turnstile from '@/components/Turnstile';

const MIN_AGE = 13;

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const captchaRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSubmit() {
    if (!email || !password) {
      setMessage('E-posta ve şifre alanlarını doldur.');
      return;
    }

    if (captchaRequired && !captchaToken) {
      setMessage('Lütfen robot olmadığını doğrula.');
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

        if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
          setMessage('Lütfen ad ve soyadını gir.');
          setLoading(false);
          return;
        }

        if (!birthDate) {
          setMessage('Lütfen doğum tarihini gir.');
          setLoading(false);
          return;
        }

        if (calculateAge(birthDate) < MIN_AGE) {
          setMessage(`Kayıt olmak için en az ${MIN_AGE} yaşında olman gerekiyor.`);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim(), full_name: fullName.trim(), birth_date: birthDate },
            captchaToken: captchaRequired ? captchaToken : undefined
          }
        });

        if (error) throw error;

        setMessage('Kayıt başarılı! Şimdi giriş yapabilirsin.');
        setRegisterMode(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: captchaRequired ? captchaToken : undefined }
        });
        if (error) throw error;

        setMessage('Giriş başarılı!');
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 500);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Bir hata oluştu.');
      setCaptchaToken('');
      setCaptchaResetKey((k) => k + 1);
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
      <div className="relative max-h-[92vh] w-full max-w-[390px] overflow-y-auto rounded-[22px] border border-border bg-card p-8 pb-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cardAlt text-xl text-muted hover:text-white"
        >
          ×
        </button>

        <div className="mb-5">
          <strong className="text-2xl tracking-wide">
            <i className="not-italic text-accent">RC</i> ATÖLYESİ
          </strong>
        </div>

        <h2 className="text-2xl font-bold">{registerMode ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        <p className="mb-6 mt-2 text-sm text-muted">
          {registerMode ? 'RC Atölyesi ailesine katıl.' : "RC Atölyesi'ne hoş geldin."}
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
          <>
            <input
              type="text"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-3 h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mb-3 h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] outline-none focus:border-accent"
            />
            <div className="mb-3 text-left">
              <label className="mb-1 block px-1 text-[11px] font-medium text-mutedDim">
                Doğum Tarihi
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="h-[50px] w-full rounded-xl border border-border bg-cardAlt px-4 text-[15px] text-zinc-200 outline-none focus:border-accent"
              />
            </div>
          </>
        )}

        {captchaRequired && (
          <div className="mb-3">
            <Turnstile onToken={setCaptchaToken} resetKey={captchaResetKey} />
          </div>
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
