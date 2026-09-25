export type ProblemStatus = 'open' | 'discussing' | 'solved';

// Aracın tipi: Araba, Drone, Uçak, Helikopter vb. — parça kategorisinden
// (Motor, ESC...) ayrı bir boyut, sorun/ilan/garaj araçlarının hepsinde ortak.
export const VEHICLE_TYPES = [
  { value: 'araba', label: 'Araba', icon: '🚗' },
  { value: 'drone', label: 'Drone', icon: '🛸' },
  { value: 'ucak', label: 'Uçak', icon: '✈️' },
  { value: 'helikopter', label: 'Helikopter', icon: '🚁' },
  { value: 'tekne', label: 'Tekne', icon: '🚤' },
  { value: 'diger', label: 'Diğer', icon: '🔧' }
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]['value'];

export function vehicleTypeIcon(value: string | null | undefined): string {
  return VEHICLE_TYPES.find((v) => v.value === value)?.icon || '🚗';
}

export function vehicleTypeLabel(value: string | null | undefined): string {
  return VEHICLE_TYPES.find((v) => v.value === value)?.label || 'Araba';
}

export type Problem = {
  id: string;
  user_id: string;
  title: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  vehicle_type?: string | null;
  description: string;
  image_url: string | null;
  status: ProblemStatus;
  slug: string;
  answer_count: number;
  created_at: string;
  author_username?: string | null;
};

export type Answer = {
  id: string;
  problem_id: string;
  user_id: string;
  body: string;
  is_accepted: boolean;
  created_at: string;
  author_username?: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export const CATEGORIES = [
  { value: 'motor', label: 'Motor' },
  { value: 'esc', label: 'ESC' },
  { value: 'servo', label: 'Servo / Direksiyon' },
  { value: 'batarya', label: 'Batarya / Şarj' },
  { value: 'sasi', label: 'Şasi / Mekanik' },
  { value: 'lastik', label: 'Lastik / Süspansiyon' },
  { value: 'diger', label: 'Diğer' }
] as const;

export const STATUS_LABEL: Record<ProblemStatus, string> = {
  open: 'Yanıt Bekliyor',
  discussing: 'Tartışılıyor',
  solved: 'Çözüldü'
};

export type ListingCondition = 'yeni' | 'kullanilmis';
export type ListingStatus = 'active' | 'sold';

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  vehicle_type?: string | null;
  condition: ListingCondition;
  price: number | null;
  description: string;
  image_url: string | null;
  status: ListingStatus;
  slug: string;
  created_at: string;
  author_username?: string | null;
};

export const LISTING_CATEGORIES = [
  { value: 'arac', label: 'Araç (Komple)' },
  { value: 'yedek-parca', label: 'Yedek Parça' },
  { value: 'elektronik', label: 'Elektronik (ESC/Motor/Servo)' },
  { value: 'batarya-sarj', label: 'Batarya / Şarj Cihazı' },
  { value: 'lastik-suspansiyon', label: 'Lastik / Süspansiyon' },
  { value: 'aksesuar', label: 'Aksesuar / El Aleti' },
  { value: 'diger', label: 'Diğer' }
] as const;

export const CONDITION_LABEL: Record<ListingCondition, string> = {
  yeni: 'Sıfır',
  kullanilmis: 'İkinci El'
};

export type GarageCar = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  vehicle_type?: string | null;
  scale: string | null;
  motor: string | null;
  esc: string | null;
  battery: string | null;
  notes: string | null;
  image_url: string | null;
  like_count: number;
  created_at: string;
  author_username?: string | null;
};

export type TopHelper = {
  user_id: string;
  username: string | null;
  solved_count: number;
};

export type SellerRating = {
  id: string;
  listing_id: string;
  seller_id: string;
  rater_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater_username?: string | null;
};

export type TopSeller = {
  user_id: string;
  sold_count: number;
  avg_rating: number;
  rating_count: number;
  username?: string | null;
};

// Satılan ilan sayısı + ortalama puana göre otomatik satıcı rütbesi.
export function sellerRank(soldCount: number, avgRating: number | null): { label: string; icon: string } {
  const r = avgRating ?? 0;
  if (soldCount >= 50 && r >= 4.8) return { label: 'Elmas Satıcı', icon: '💎' };
  if (soldCount >= 25 && r >= 4.5) return { label: 'Altın Satıcı', icon: '🥇' };
  if (soldCount >= 10 && r >= 4.0) return { label: 'Gümüş Satıcı', icon: '🥈' };
  if (soldCount >= 3) return { label: 'Bronz Satıcı', icon: '🥉' };
  return { label: 'Yeni Satıcı', icon: '🆕' };
}

// Çözülen soru sayısına göre bir kullanıcıya verilecek rozet.
export function badgeForSolvedCount(count: number): { label: string; icon: string } | null {
  if (count >= 15) return { label: 'Usta', icon: '🏆' };
  if (count >= 5) return { label: 'Uzman', icon: '🔧' };
  if (count >= 1) return { label: 'Yardımsever', icon: '🌱' };
  return null;
}

const BADGE_STEPS = [
  { threshold: 1, label: 'Yardımsever', icon: '🌱' },
  { threshold: 5, label: 'Uzman', icon: '🔧' },
  { threshold: 15, label: 'Usta', icon: '🏆' }
];

// Profil sayfasında "bir sonraki rozete X çözüm kaldı" göstermek için.
export function nextBadgeProgress(count: number): {
  current: { label: string; icon: string } | null;
  next: { label: string; icon: string; remaining: number; progressPercent: number } | null;
} {
  const current = badgeForSolvedCount(count);
  const stepIndex = BADGE_STEPS.findIndex((s) => s.threshold > count);
  if (stepIndex === -1) return { current, next: null };

  const next = BADGE_STEPS[stepIndex];
  const prevThreshold = stepIndex > 0 ? BADGE_STEPS[stepIndex - 1].threshold : 0;
  const span = next.threshold - prevThreshold;
  const progressPercent = span > 0 ? Math.round(((count - prevThreshold) / span) * 100) : 0;

  return {
    current,
    next: { label: next.label, icon: next.icon, remaining: next.threshold - count, progressPercent }
  };
}
