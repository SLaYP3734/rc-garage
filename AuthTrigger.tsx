'use client';

import { useState } from 'react';
import AuthModal from './AuthModal';

// Giriş yapmamış kullanıcıya header'da ve gerektiğinde başka yerlerde
// gösterilen buton. Tıklanınca giriş/kayıt modalını açar.
export default function AuthTrigger({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
