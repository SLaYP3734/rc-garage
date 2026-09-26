-- RC Atölyesi — İlanlara çoklu fotoğraf (galeri) desteği
-- ============================================================
-- Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
-- (Bu dosyada değiştirilecek bir UUID yok, direkt çalıştırabilirsin.)
-- ============================================================

-- Var olan "image_url" (tek kapak fotoğrafı) sütunu kalıyor, geriye
-- dönük uyumluluk için (eski ilanlar, kart görünümü vb. hâlâ bunu
-- kullanıyor). Yeni "image_urls" tüm fotoğrafları sırayla tutuyor,
-- ilk eleman her zaman image_url ile aynı (kapak fotoğrafı).
alter table listings add column if not exists image_urls text[] not null default '{}'::text[];
