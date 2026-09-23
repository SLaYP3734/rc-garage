// Salt gösterim amaçlı yıldız satırı (5 üzerinden). Tıklanabilir seçim
// için ayrı, interaktif olan RateSellerForm.tsx içindeki butonlar kullanılıyor.
export default function StarRating({
  value,
  size = 13
}: {
  value: number;
  size?: number;
}) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center" style={{ fontSize: size }} aria-label={`${value} / 5 yıldız`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? 'text-accent' : 'text-zinc-600'}>
          ★
        </span>
      ))}
    </span>
  );
}
