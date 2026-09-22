/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Kullanıcılar soru paylaşırken herhangi bir siteden fotoğraf linki
    // yapıştırabiliyor, bu yüzden domain listesini kısıtlamak yerine
    // tüm https kaynaklarına izin veriyoruz.
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};

export default nextConfig;
