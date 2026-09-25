import type { Metadata } from 'next';
import ContactButton from '@/components/ContactButton';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    'RC Atölyesi kimin tarafından, neden kuruldu? Kurucusu Ender ile tanışın ve platformun amacını öğrenin.'
};

export default function HakkimizdaPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-2xl">
          👋
        </div>
        <div>
          <h1 className="text-xl font-extrabold">Hakkımızda</h1>
          <p className="text-sm text-muted">Bu siteyi kim, neden kurdu?</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed text-zinc-200">
        <p>
          Merhaba, ben <strong className="text-white">Ender</strong>. RC (uzaktan kumandalı) araçlarla
          <strong className="text-white"> 2009</strong>'dan beri, yani 15 yılı aşkın süredir uğraşıyorum —
          arızasını kendim söktüm, motorunu yaktım, gecenin bir yarısı bir dişli için forum forum
          gezdim. Bu hobiyi gerçekten seven biriyim.
        </p>
        <p>
          RC Atölyesi'ni kurma fikrim de tam olarak buradan çıktı: Türkiye'de RC severlerin dağınık
          şekilde Facebook grupları, WhatsApp grupları ve forumlar arasında bölünmüş olduğunu
          görüyordum. Bir arızayı sorduğunda cevabı bulmak, ikinci el bir parça aradığında doğru
          yeri bulmak hep zahmetli oluyordu. Amacım basit: <strong className="text-white">
          Türkiye'deki RC severlerin tek bir çatı altında buluştuğu bir platform</strong> oluşturmak
          — sorular sorulsun ve cevaplansın, ikinci el/sıfır ürünler güvenle alınıp satılsın, araçlar
          galeri gibi paylaşılsın.
        </p>
        <p>
          Site yeni ve büyüyen bir topluluk, bu yüzden içindeki her soru, ilan ve yorum gerçek
          insanlar tarafından paylaşılıyor — kurgu bir hikaye ya da otomatik üretilmiş içerik değil.
          Şu an küçük bir çekirdek kitle var ama hedefim burayı Türkiye'nin en kapsamlı RC
          topluluğuna dönüştürmek.
        </p>
        <p>
          Sitede gördüğün her şeyi (moderasyon, yeni özellikler, teknik altyapı) ben yönetiyorum.
          Bir sorunla karşılaşırsan, bir öneri ya da eleştirin varsa, ya da sadece merhaba demek
          istersen aşağıdaki formdan bana ulaşabilirsin — mesajlar doğrudan bana geliyor.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl border border-border bg-cardAlt p-3">
          <div className="text-lg">🔧</div>
          <p className="mt-1 text-[12px] font-semibold text-muted">Arıza & Soru-Cevap</p>
        </div>
        <div className="rounded-xl border border-border bg-cardAlt p-3">
          <div className="text-lg">🛒</div>
          <p className="mt-1 text-[12px] font-semibold text-muted">Al-Sat</p>
        </div>
        <div className="rounded-xl border border-border bg-cardAlt p-3">
          <div className="text-lg">📸</div>
          <p className="mt-1 text-[12px] font-semibold text-muted">Galeri</p>
        </div>
      </div>

      <div className="mt-6">
        <ContactButton buttonLabel="✉️ Bana Ulaş" modalTitle="✉️ Ender'e Mesaj Gönder" />
      </div>
    </div>
  );
}
