// Google'ın "Traxxas Maxx motoru bozuldu" gibi bir aramada bu soruyu
// doğrudan gösterebilmesi için her sorunun kendi, anlamlı ve kalıcı bir
// adresi (URL'si) olması gerekiyor. Bu fonksiyon o adresi üretir.
const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u'
};

export function slugify(input: string): string {
  const normalized = input
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('');

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function buildProblemSlug(brand: string, model: string, title: string): string {
  const base = slugify(`${brand} ${model} ${title}`) || slugify(title) || 'sorun';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
