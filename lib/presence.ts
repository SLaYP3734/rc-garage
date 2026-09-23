import { timeAgo } from '@/lib/time';

// Son 2 dakika içinde "nabız" attıysa (PresenceHeartbeat sayesinde)
// kullanıcı çevrimiçi kabul ediliyor.
const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

export function presenceLabel(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return 'Hiç görülmedi';
  if (isOnline(lastSeenAt)) return 'Çevrimiçi';
  return `Son görülme: ${timeAgo(lastSeenAt)} önce`;
}
