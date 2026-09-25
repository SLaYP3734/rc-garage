import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-border px-4 py-5 text-center">
      <p className="text-[12px] text-mutedDim">
        <Link href="/hakkimizda" className="font-semibold text-accent2">
          Hakkımızda
        </Link>
        {' · '}
        RC Atölyesi © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
