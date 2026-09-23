import Link from 'next/link';

type Stats = {
  problemCount: number;
  solvedCount: number;
  listingCount: number;
  memberCount: number;
};

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

// Ana sayfanın en üstündeki karşılama şeridi. Sade bir liste yerine
// siteye "canlı" ve topluluk hissi veren bir giriş — kaç sorunun
// çözüldüğünü, kaç ilan olduğunu görmek, yeni bir ziyaretçiye burada
// gerçek bir hareketlilik olduğunu anında gösteriyor.
export default function HomeHero({ stats }: { stats: Stats }) {
  return (
    <div className="relative overflow-hidden border-b border-border px-4 pb-5 pt-6">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff6a00, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative">
        {ADMIN_USER_ID && (
          <Link
            href={`/mesajlar/${ADMIN_USER_ID}`}
            className="mt-3 block w-fit rounded-full border border-border bg-cardAlt px-3 py-1.5 text-[11.5px] font-semibold text-zinc-200 hover:border-accent hover:text-accent"
          >
            ✉️ Her Konuda Bizimle İletişime Geçin
          </Link>
        )}

        <div className="mt-4 grid grid-cols-4 gap-2">
          <StatTile value={stats.problemCount} label="Soru" />
          <StatTile value={stats.solvedCount} label="Çözüldü" accent />
          <StatTile value={stats.listingCount} label="İlan" />
          <StatTile value={stats.memberCount} label="Üye" />
        </div>

        <div className="mt-4 flex items-stretch gap-2">
          <Link
            href="/sorun/yeni"
            className="flex flex-1 items-center justify-center rounded-xl bg-accent px-2 py-2.5 text-center text-[13px] font-extrabold leading-tight text-black"
          >
            🔧 Arıza Çözümleme
          </Link>
          <Link
            href="/al-sat"
            className="flex flex-1 items-center justify-center rounded-xl border border-border bg-cardAlt px-2 py-2.5 text-center text-[13px] font-bold leading-tight text-zinc-200"
          >
            🛒 Al / Sat
          </Link>
          <Link
            href="/vitrin"
            className="flex flex-1 items-center justify-center rounded-xl border border-border bg-cardAlt px-2 py-2.5 text-center text-[13px] font-bold leading-tight text-zinc-200"
          >
            📸 Galeri
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatTile({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-1.5 py-2 text-center">
      <div className={`text-[15px] font-extrabold ${accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium text-mutedDim">{label}</div>
    </div>
  );
}
