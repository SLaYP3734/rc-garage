'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthModal from './AuthModal';

export default function AnswerForm({ problemId }: { problemId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!body.trim()) return;

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('answers').insert({
      problem_id: problemId,
      user_id: user.id,
      body: body.trim()
    });

    // Yeni bir yanıt geldiğinde konu artık "yanıt bekliyor" değil,
    // "tartışılıyor" durumuna geçsin (çözüldü olarak işaretlenmediyse).
    await supabase
      .from('problems')
      .update({ status: 'discussing' })
      .eq('id', problemId)
      .neq('status', 'solved');

    setSubmitting(false);

    if (error) {
      console.error(error);
      setMessage('Yanıt gönderilemedi, tekrar dener misin?');
      return;
    }

    setBody('');
    setMessage('');
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Bu konuda tecrüben varsa yardımcı ol..."
          rows={3}
          className="w-full resize-y rounded-xl border border-border bg-cardAlt px-3.5 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="mt-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {submitting ? 'Gönderiliyor...' : 'Yanıtla'}
        </button>
        {message && <p className="mt-2 text-[13px] text-accent2">{message}</p>}
      </form>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
