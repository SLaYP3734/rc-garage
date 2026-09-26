import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import MarqueeBanner from '@/components/MarqueeBanner';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import SoundUnlocker from '@/components/SoundUnlocker';
import PresenceHeartbeat from '@/components/PresenceHeartbeat';
import BanGate from '@/components/BanGate';
import PwaRegister from '@/components/PwaRegister';
import InstallBanner from '@/components/InstallBanner';
import VisitorHeartbeat from '@/components/VisitorHeartbeat';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RC Atölyesi — Uzaktan Kumandalı Severlerin Platformu',
    template: '%s | RC Atölyesi'
  },
  description:
    'RC araçlarla ilgili arıza, bakım ve upgrade sorularının sorulduğu ve deneyimli kullanıcılar tarafından yanıtlandığı Türkçe topluluk.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'RC Atölyesi'
  },
  verification: {
    // İki ayrı Google Search Console kaydı doğrulanıyor: ilki eski Vercel
    // adresi (rc-garage-three.vercel.app), ikincisi yeni domain
    // (rcatolyesi.com). İkisi de aynı anda geçerli kalsın diye ikisini de
    // tutuyoruz — Next.js bu alana birden fazla kod (dizi) verilmesine izin
    // veriyor, sayfada iki ayrı <meta name="google-site-verification"> etiketi olarak çıkıyor.
    google: ['JJ6XdAjqZQ4HY3WrB5BlC0x0eDqWMVq_mCTA_90H40I', 'CWXzijgWLgxyOMK5OQqD3m--njPyir0hnPcxTp7MoD0']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RC Atölyesi'
  }
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <SoundUnlocker />
        <PresenceHeartbeat />
        <VisitorHeartbeat />
        <BanGate />
        <PwaRegister />
        <div className="mx-auto flex min-h-screen w-full max-w-app flex-col bg-surface pb-24 md:max-w-[880px] md:border-x md:border-border md:shadow-2xl lg:max-w-[1040px]">
          <Header />
          <MarqueeBanner />
          <InstallBanner />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
