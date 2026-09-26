// Fotoğrafı yüklemeden önce tarayıcıda küçültüp sıkıştıran ortak yardımcı.
// Hem tekli (ImageUpload) hem çoklu (MultiImageUpload) fotoğraf yükleme
// bileşenleri bunu kullanıyor — amaç:
// - Depolama (Supabase Storage) alanını gereksiz yere doldurmasın
// - Sayfa açılışları/mobil veri kullanımı hızlı kalsın
// - Kullanıcı büyük bir dosya boyutu sınırına nadiren takılsın, çünkü
//   çoğu telefon fotoğrafı zaten bu adımda birkaç yüz KB'a iner.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
// Zaten küçük/optimize dosyaları tekrar sıkıştırıp kalite kaybetmeye gerek yok.
const SKIP_COMPRESSION_UNDER_BYTES = 350 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_COMPRESSION_UNDER_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width >= height) {
        height = Math.round((height / width) * MAX_DIMENSION);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width / height) * MAX_DIMENSION);
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    // Sıkıştırma başarısız olursa (eski tarayıcı, bozuk dosya vb.)
    // orijinal dosyayla devam et, yükleme yine de denenebilsin.
    console.error('Fotoğraf sıkıştırılamadı, orijinal yükleniyor:', err);
    return file;
  }
}
