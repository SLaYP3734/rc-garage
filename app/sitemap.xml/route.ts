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

type Row = { slug: string; created_at: string; brand?: string | null };

function slugifyBrand(brand: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u'
  };
  return brand
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function fetchRows(table: string, select = 'slug,created_at'): Promise<Row[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=${select}&order=created_at.desc&limit=5000`,
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
  const [problems, listings, garageCars, blogPosts] = await Promise.all([
    fetchRows('problems', 'slug,created_at,brand'),
    fetchRows('listings', 'slug,created_at,brand'),
    fetchRows('garage_cars', 'brand,created_at'),
    fetchRows('blog_posts', 'slug,created_at&published=eq.true')
  ]);

  const staticEntries = [
    urlTag(siteUrl, undefined, 'hourly', '1'),
    urlTag(`${siteUrl}/sorun/yeni`, undefined, 'monthly', '0.5'),
    urlTag(`${siteUrl}/sorular`, undefined, 'hourly', '0.9'),
    urlTag(`${siteUrl}/hakkimizda`, undefined, 'monthly', '0.6'),
    urlTag(`${siteUrl}/al-sat`, undefined, 'hourly', '0.9'),
    urlTag(`${siteUrl}/ilan/yeni`, undefined, 'monthly', '0.5'),
    urlTag(`${siteUrl}/vitrin`, undefined, 'hourly', '0.7'),
    urlTag(`${siteUrl}/blog`, undefined, 'daily', '0.7')
  ];

  const problemEntries = problems.map((p) => urlTag(`${siteUrl}/sorun/${p.slug}`, p.created_at));
  const listingEntries = listings.map((l) => urlTag(`${siteUrl}/ilan/${l.slug}`, l.created_at));
  const blogEntries = blogPosts.map((b) => urlTag(`${siteUrl}/blog/${b.slug}`, b.created_at, 'weekly', '0.7'));

  const brandSlugs = new Set<string>();
  [...problems, ...listings, ...garageCars].forEach((row) => {
    if (row.brand) brandSlugs.add(slugifyBrand(row.brand));
  });

  const brandEntries = Array.from(brandSlugs)
    .filter(Boolean)
    .map((slug) => urlTag(`${siteUrl}/marka/${slug}`, undefined, 'weekly', '0.6'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...staticEntries,
    ...problemEntries,
    ...listingEntries,
    ...blogEntries,
    ...brandEntries
  ].join('')}</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
