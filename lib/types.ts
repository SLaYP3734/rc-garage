export type ProblemStatus = 'open' | 'discussing' | 'solved';

export type Problem = {
  id: string;
  user_id: string;
  title: string;
  brand: string | null;
  model: string | null;
  category: string | null;
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

// Çözülen soru sayısına göre bir kullanıcıya verilecek rozet.
export function badgeForSolvedCount(count: number): { label: string; icon: string } | null {
  if (count >= 15) return { label: 'Usta', icon: '🏆' };
  if (count >= 5) return { label: 'Uzman', icon: '🔧' };
  if (count >= 1) return { label: 'Yardımsever', icon: '🌱' };
  return null;
}
