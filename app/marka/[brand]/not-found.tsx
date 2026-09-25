import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <div className="mb-3 text-5xl">🔍</div>
      <h1 className="text-lg font-bold">Bu markaya ait içerik bulunamadı</h1>
      <p className="mx-auto mt-2 max-w-[280px] text-sm text-muted">
        Henüz bu markayla ilgili paylaşım yapılmamış olabilir.
      </p>
      <Link
        href="/sorular"
        className="mt-5 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
      >
        Akışa dön
      </Link>
    </div>
  );
}
