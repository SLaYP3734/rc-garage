import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

type ProblemRow = { slug: string; created_at: string };

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

    return [...staticRoutes, ...problemRoutes];
  } catch (err) {
    console.error('sitemap generation failed:', err);
    return staticRoutes;
  }
}
