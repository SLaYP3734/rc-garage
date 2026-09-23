'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import ModalPortal from '@/components/ModalPortal';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

const SUBJECTS = ['Genel Soru', 'Şikayet', 'Öneri', 'Hesap Sorunu', 'Teknik Sorun', 'Diğer'];

// Sayfanın altında yer alan "Bizimle İletişime Geç" butonu. Artık
// tıklanınca doğrudan yöneticiyle mesajlaşma ekranı açılmıyor — bunun
// yerine önce bir "Konu" seçilip mesaj yazılan küçük bir form açılıyor.
// Gönderilen mesaj yine normal mesajlar tablosuna, yöneticinin
// gelen kutusuna düşüyor; yöneticinin ekstra bir şey yapmasına gerek yok.
export default function ContactButton() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  if (!ADMIN_USER_ID) return null;

  async function handleSend() {
    if (!message.trim()) {
      setStatus('Lütfen mesajını yaz.');
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSending(true);
    setStatus('');

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: ADMIN_USER_ID,
      body: `📋 Konu: ${subject}\n\n${message.trim()}`
    });

    setSending(false);

    if (error) {
      console.error(error);
      setStatus('Gönderilemedi, tekrar dene.');
      return;
    }

    setStatus('✅ Mesajın iletildi, teşekkürler!');
    setMessage('');
  }

  return (
    <>
      <div className="px-4 py-8 text-center">
        <button
          onClick={() => setOpen(true)}
          className="mx-auto rounded-full border border-border bg-cardAlt px-4 py-2.5 text-[13px] font-semibold text-zinc-200 hover:border-accent hover:text-accent"
        >
          ✉️ Her Konuda Bizimle İletişime Geçin
        </button>
      </div>

      {open && (
        <ModalPortal>
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative max-h-[90dvh] w-full max-w-[380px] overflow-y-auto rounded-2xl border border-border bg-card p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3.5 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cardAlt text-xl text-muted hover:text-white"
            >
              ×
            </button>

            <h2 className="mb-1 text-lg font-bold">✉️ Bize Ulaş</h2>
            <p className="mb-4 text-sm text-muted">
              Sorunun, şikayetin veya önerin ne olursa olsun, buradan bize ulaşabilirsin.
            </p>

            <label className="mb-1 block text-[11px] font-medium text-mutedDim">Konu</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-3 h-[46px] w-full rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-[11px] font-medium text-mutedDim">Mesajın</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Ne yazmak istersen..."
              className="w-full resize-y rounded-xl border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
            />

            <button
              onClick={handleSend}
              disabled={sending}
              className="mt-3 h-[48px] w-full rounded-xl bg-accent text-[15px] font-extrabold text-black disabled:opacity-60"
            >
              {sending ? 'Gönderiliyor...' : 'Gönder'}
            </button>

            {status && <p className="mt-2 text-center text-[13px] text-accent2">{status}</p>}
          </div>
        </div>
        </ModalPortal>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
