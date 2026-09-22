import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Google'ın siteyi taramasını kolaylaştıran otomatik sitemap.xml.
// Next.js bu dosyayı /sitemap.xml adresinde otomatik olarak yayınlar.
// Yeni bir soru eklendiğinde elle bir şey yapmana gerek yok, bu liste
// her istek geldiğinde veritabanından taze olarak üretiliyor.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rc-garage-three.vercel.app';

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

  // Ortam değişkenleri bir sebeple eksikse sitemap tamamen çökmesin,
  // en azından statik sayfaları döndürsün.
  if (!supabaseUrl || !supabaseKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: problems } = await supabase
      .from('problems')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);

    const problemRoutes: MetadataRoute.Sitemap = (problems || []).map((p) => ({
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
