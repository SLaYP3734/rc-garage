// Yeni bir mesaj geldiğinde çalınacak kısa "pling" sesi. Harici bir ses
// dosyasına bağımlı olmasın diye tarayıcının kendi ses motoruyla
// (Web Audio API) anlık olarak üretiliyor.
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

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
