type Stats = {
  problemCount: number;
  solvedCount: number;
  listingCount: number;
  memberCount: number;
};

// Site istatistikleri (Soru / Çözüldü / İlan / Üye) — artık ana sayfanın
// en altında, "Bizimle İletişime Geçin" butonunun hemen üstünde.
export default function HomeStats({ stats }: { stats: Stats }) {
  return (
    <div className="px-4 pt-2">
      <div className="grid grid-cols-4 gap-2 rounded-2xl bg-cardAlt px-2 py-4">
        <StatTile value={stats.problemCount} label="Soru" />
        <StatTile value={stats.solvedCount} label="Çözüldü" accent />
        <StatTile value={stats.listingCount} label="İlan" />
        <StatTile value={stats.memberCount} label="Üye" />
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
