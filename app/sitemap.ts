import type { MetadataRoute } from 'next';

<<<<<<< HEAD
// Google'ın siteyi taramasını kolaylaştıran otomatik sitemap.xml.
// Next.js bu dosyayı /sitemap.xml adresinde otomatik olarak yayınlar.
// Bilinçli olarak @supabase/supabase-js kütüphanesi kullanılmıyor —
// Next.js'in sitemap derleme adımıyla o kütüphane uyumsuzluk çıkarıyordu.
// Bunun yerine Supabase'in REST arayüzüne doğrudan basit bir istek
// (fetch) atılıyor, aynı sonucu veriyor ama derlemeyi bozmuyor.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

type ProblemRow = { slug: string; created_at: string };
type ListingRow = { slug: string; created_at: string };
=======
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

type ProblemRow = { slug: string; created_at: string };
>>>>>>> 87895f7deaf0272afb2c5d257ac7e8d34cf90462

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: 'hourly',
      priority: 1
    },
    {
      url: `${siteUrl}/sorun/yeni`,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${siteUrl}/al-sat`,
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: `${siteUrl}/ilan/yeni`,
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return staticRoutes;
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/problems?select=slug,created_at&order=created_at.desc&limit=5000`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        },
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return staticRoutes;

    const problems: ProblemRow[] = await res.json();

    const problemRoutes: MetadataRoute.Sitemap = problems.map((p) => ({
      url: `${siteUrl}/sorun/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8
    }));

    let listingRoutes: MetadataRoute.Sitemap = [];
    try {
      const listingsRes = await fetch(
        `${supabaseUrl}/rest/v1/listings?select=slug,created_at&order=created_at.desc&limit=5000`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          },
          next: { revalidate: 3600 }
        }
      );

      if (listingsRes.ok) {
        const listings: ListingRow[] = await listingsRes.json();
        listingRoutes = listings.map((l) => ({
          url: `${siteUrl}/ilan/${l.slug}`,
          lastModified: l.created_at ? new Date(l.created_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8
        }));
      }
    } catch {
      // listings tablosu henüz yoksa sitemap yine de çalışsın.
    }

    return [...staticRoutes, ...problemRoutes, ...listingRoutes];
  } catch (err) {
    console.error('sitemap generation failed:', err);
    return staticRoutes;
  }
}
