'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Bazı üst bileşenlerde (örn. Header'daki bulanıklaştırma efekti,
// backdrop-blur) kullanılan CSS özellikleri, "position: fixed" ile
// açılan pencerelerin ekrana değil o üst bileşene göre konumlanmasına
// sebep olabiliyor — bu da pencerenin ekranın dışına taşmasına yol
// açan asıl sorundu. Bu bileşen, içindeki pencereyi nereden
// çağrılırsa çağrılsın doğrudan sayfanın en dışına (body'ye) taşıyarak
// bu sorunu kalıcı olarak önlüyor.
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
