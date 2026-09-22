import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SoundUnlocker from '@/components/SoundUnlocker';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RC Garage — RC araç sorunlarına çözüm',
    template: '%s | RC Garage'
  },
  description:
    'RC araçlarla ilgili arıza, bakım ve upgrade sorularının sorulduğu ve deneyimli kullanıcılar tarafından yanıtlandığı Türkçe topluluk.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'RC Garage'
  },
  verification: {
    google: 'JJ6XdAjqZQ4HY3WrB5BlC0x0eDqWMVq_mCTA_90H40I'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <SoundUnlocker />
        <div className="mx-auto flex min-h-screen w-full max-w-app flex-col bg-surface pb-24">
          <Header />
          <main className="flex-1">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
