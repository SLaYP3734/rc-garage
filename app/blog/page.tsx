import { redirect } from 'next/navigation';

// Blog yazı listesi artık ana sayfada (/) gösteriliyor — burası eski
// yer imlerinin/linklerin kırılmaması için oraya yönlendiriyor.
export default function BlogListRedirect() {
  redirect('/');
}
