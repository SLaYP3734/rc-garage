-- RC Atölyesi — Geri Çağırma Bildirimleri için gerekli kolon
-- ============================================================
-- Birkaç gündür siteye uğramamış üyelere gönderilen "seni özledik"
-- bildiriminin aynı kişiye çok sık gitmemesi için kullanılıyor.
-- SQL Editor -> New query -> tamamını yapıştır -> Run.
-- ============================================================

alter table profiles add column if not exists last_recall_sent_at timestamptz;
