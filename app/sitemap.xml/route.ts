import { NextResponse } from 'next/server';

// Google'ın siteyi taramasını kolaylaştıran /sitemap.xml adresi.
//
// Not: Next.js'in kendi "app/sitemap.ts" özel dosya sistemi (metadata
// route) burada tekrarlayan, açıklaması zor bir derleme hatası
// veriyordu. Bu yüzden bilinçli olarak o sistemi kullanmıyoruz —
// bunun yerine sıradan bir Route Handler ile XML'i elle üretip
// döndürüyoruz. Fonksiyonel olarak tamamen aynı sonucu verir, ama
// derlemesi çok daha sağlam.

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

type Row = { slug: string; created_at: string };

async function fetchRows(table: string): Promise<Row[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=slug,created_at&order=created_at.desc&limit=5000`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        },
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function urlTag(loc: string, lastmod?: string, changefreq = 'weekly', priority = '0.8') {
  return `<url><loc>${loc}</loc>${
    lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''
  }<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export async function GET() {
  const [problems, listings] = await Promise.all([fetchRows('problems'), fetchRows('listings')]);

  const staticEntries = [
    urlTag(siteUrl, undefined, 'hourly', '1'),
    urlTag(`${siteUrl}/sorun/yeni`, undefined, 'monthly', '0.5'),
    urlTag(`${siteUrl}/al-sat`, undefined, 'hourly', '0.9'),
    urlTag(`${siteUrl}/ilan/yeni`, undefined, 'monthly', '0.5')
  ];

  const problemEntries = problems.map((p) => urlTag(`${siteUrl}/sorun/${p.slug}`, p.created_at));
  const listingEntries = listings.map((l) => urlTag(`${siteUrl}/ilan/${l.slug}`, l.created_at));

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...staticEntries,
    ...problemEntries,
    ...listingEntries
  ].join('')}</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
