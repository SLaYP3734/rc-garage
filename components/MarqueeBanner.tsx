// Header'daki büyük "RC ATÖLYESİ" logosunun hemen altında, daha küçük,
// hareketli/kayan dikkat çekici bir şerit. Saf CSS animasyonu ile
// çalışıyor, JavaScript gerekmiyor — bu yüzden sunucu bileşeni olarak
// kalabiliyor (hızlı, ekstra yük yok).
const MESSAGE =
  '🔧 Türkiye’nin RC Atölyesi  •  🚗 Aracını Paylaş  •  🛒 Al / Sat Yap  •  ❓ Sorunu Sor, Çözümü Bul  •  🏆 Güvenilir Topluluk';

export default function MarqueeBanner() {
  return (
    <div className="overflow-hidden border-b border-border bg-cardAlt py-1.5">
      <div className="marquee-track flex w-max whitespace-nowrap">
        <span className="px-4 text-[11.5px] font-semibold text-zinc-300">{MESSAGE}</span>
        <span className="px-4 text-[11.5px] font-semibold text-zinc-300" aria-hidden>
          {MESSAGE}
        </span>
      </div>
    </div>
  );
}
