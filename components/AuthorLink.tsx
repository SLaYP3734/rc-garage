'use client';

import Link from 'next/link';

// Kart içinde kullanıcı adına tıklanınca satıcı/kullanıcı profiline
// gitmesi için. Kartın tamamı zaten tıklanabilir olduğundan (soru/ilan
// detayına gidiyor), buradaki tıklamanın o üst olayı tetiklememesi için
// stopPropagation kullanıyoruz.
export default function AuthorLink({
  username,
  className
}: {
  username: string;
  className?: string;
}) {
  return (
    <Link
      href={`/satici/${username}`}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {username}
    </Link>
  );
}
