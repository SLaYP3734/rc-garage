import { redirect } from 'next/navigation';

// Akış tekrar ana sayfaya (/) taşındı — burası eski linklerin kırılmaması
// için oraya yönlendiriyor.
export default function SorularRedirect() {
  redirect('/');
}
