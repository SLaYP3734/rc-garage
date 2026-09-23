import Image from 'next/image';

// Kullanıcı profil resmi varsa onu, yoksa kullanıcı adının ilk harfini
// gösteren daire. Profil, satıcı profili ve ilan detayı gibi tüm
// yerlerde aynı görünüm için kullanılıyor.
export default function Avatar({
  url,
  name,
  size = 44
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  if (url) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full border border-border bg-cardAlt"
        style={{ width: size, height: size }}
      >
        <Image src={url} alt={name || 'Profil resmi'} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-black"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  );
}
