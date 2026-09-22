// Kartın sol kenarındaki renk şeridi markaya göre değişir; akışı
// taradığında göz markaya göre renk eşlemesi yapmaya başlar (Traxxas
// turuncu, Arrma kırmızı gibi), bu da Instagram'daki fotoğraf ağırlıklı
// akıştan farklı, kendine özgü bir tarama deneyimi yaratır.
const BRAND_COLORS: Record<string, string> = {
  traxxas: '#ff6a00',
  arrma: '#e6272c',
  axial: '#2f6fed',
  losi: '#f2c200',
  kyosho: '#d61f3c',
  'team associated': '#0ea5e9',
  hpi: '#7c3aed',
  redcat: '#ef4444',
  'mn model': '#22c55e',
  rlaarlo: '#14b8a6'
};

const FALLBACK_COLORS = ['#ff6a00', '#0ea5e9', '#22c55e', '#e6272c', '#a855f7', '#f2c200'];

export function brandColor(brand: string | null | undefined): string {
  if (!brand) return '#3f3f46';
  const key = brand.trim().toLowerCase();
  if (BRAND_COLORS[key]) return BRAND_COLORS[key];

  // Bilinmeyen marka: isimden sabit bir renk üret, her seferinde aynı çıksın.
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}
