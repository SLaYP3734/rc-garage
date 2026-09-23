import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <div className="mb-3 text-5xl">🔍</div>
      <h1 className="text-lg font-bold">Bu kullanıcı bulunamadı</h1>
      <p className="mx-auto mt-2 max-w-[280px] text-sm text-muted">
        Kullanıcı adı yanlış yazılmış olabilir.
      </p>
      <Link
        href="/al-sat"
        className="mt-5 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
      >
        Al/Sat'a dön
      </Link>
    </div>
  );
}
