# RC Garage — Next.js sürümü

Bu, sitenin önceki (Vite) sürümünün yerine geçen yeni yapısı. Neyin
değiştiğini ve nasıl devreye alacağını burada bulabilirsin.

## Ne değişti?

- **Site artık Next.js ile çalışıyor.** Önceki sürüm tek bir boş sayfa
  açıp içeriği JavaScript ile dolduruyordu (SPA). Bu yapıda Google
  siteyi zor okuyordu. Yeni yapıda her sayfa sunucuda hazır HTML olarak
  üretiliyor.
- **Her "sorun" kendi adresine sahip:** `/sorun/<baslik>-<kod>` gibi.
  Sayfa başlığı ve açıklaması sorudan otomatik üretiliyor, bu yüzden
  "Traxxas Maxx motoru bozuldu" gibi bir Google araması artık doğrudan
  o soruyu gösterebilir.
- **Yeni tasarım ("Atölye Panosu"):** Ne Instagram'daki gibi büyük
  fotoğraf kartları, ne düz bir forum listesi. Marka renginde kenar
  şeridi, durum rozeti (Yanıt Bekliyor / Tartışılıyor / Çözüldü) ve
  yanıt sayısı olan kompakt kartlar.
- **Giriş/kayıt, profil ve "Garajım"** eskisiyle aynı şekilde çalışıyor,
  sadece Next.js'e taşındı.
- **Yeni: "Sorun Sor" gerçek bir özellik oldu.** Herkes soru açabilir,
  herkes (giriş yaparak) yanıtlayabilir, soru sahibi bir yanıtı "çözüm"
  olarak işaretleyebilir.

## Kurulum adımların

### 1. Supabase'de yeni tabloları oluştur

`supabase/schema.sql` dosyasının tamamını kopyala, Supabase panelinde
**SQL Editor -> New query** kısmına yapıştır ve çalıştır. Bu, `problems`
ve `answers` tablolarını (ve gerekli güvenlik kurallarını) oluşturur.
Mevcut `profiles` ve `garage_cars` tablolarına dokunmaz.

### 2. Ortam değişkenlerini ayarla

`.env.local.example` dosyasını `.env.local` olarak kopyala ve
`NEXT_PUBLIC_SUPABASE_ANON_KEY` değerini Supabase panelinden
(Project Settings -> API -> anon public key) al, yapıştır.

Vercel'e deploy ederken aynı iki değişkeni Vercel panelinde
**Project Settings -> Environment Variables** altına da eklemen gerekiyor.

### 3. GitHub'a yükle

Bu klasörü mevcut `rc-garage` reponun içeriğiyle değiştir (veya yeni bir
repo aç), commit'le ve push'la. Vercel projeyi otomatik yeniden build
eder — `npm install` işini orada Vercel yapar, bende değil.

### 4. (İstersen) Kendi bilgisayarında dene

```
npm install
npm run dev
```

sonra `http://localhost:3000` adresini aç.

## Sırada ne var?

- "Al / Sat" (ilan) bölümü bilinçli olarak henüz eklenmedi.
- İstersen bir sonraki adımda arama sonuçlarını daha da güçlendirmek
  için sitemap.xml ekleyebiliriz.
