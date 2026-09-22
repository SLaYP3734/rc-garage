// Yeni bir mesaj geldiğinde çalınacak kısa "pling" sesi. Harici bir ses
// dosyasına bağımlı olmasın diye tarayıcının kendi ses motoruyla
// (Web Audio API) anlık olarak üretiliyor.
//
// Not: Telefon tarayıcıları (özellikle iPhone/Safari), kullanıcı sayfaya
// hiç dokunmadan otomatik ses çalınmasını engelliyor ("suspended" durumda
// başlıyor). Bu yüzden aynı AudioContext'i saklayıp, kullanıcının ilk
// dokunuşunda (tıklama/dokunma) "kilidini açıyoruz" — o andan sonra
// arka planda (bir sayaçla) tetiklenen sesler de çalabiliyor.
let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  return sharedCtx;
}

// Kullanıcının sayfadaki ilk dokunuşunda/tıklamasında çağrılır.
export function unlockNotificationSound() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

export function playNotificationSound() {
  try {
    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      // Henüz kilidi açılmadıysa (kullanıcı hiç dokunmadıysa) tarayıcı
      // sesi çalmayabilir; yine de denemekte fayda var.
      ctx.resume().catch(() => {});
    }

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(880, 0, 0.14);
    playTone(1318.5, 0.1, 0.18);
  } catch {
    // Ses çalınamazsa sessizce geç, siteyi bozmasın.
  }
}
