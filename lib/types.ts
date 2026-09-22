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
