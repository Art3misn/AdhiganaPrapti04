// notif-sound.js - Audio Manager untuk notifikasi
class NotificationSound {
  constructor() {
    this.audioContext = null;
    this.isReady = false;
    this.pendingSounds = [];
    this.initialized = false;
  }

  // Inisialisasi AudioContext (harus dipanggil setelah user interaction)
  init() {
    if (this.initialized) return Promise.resolve();

    try {
      // Coba pakai AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Coba resume
      if (this.audioContext.state === 'suspended') {
        return this.audioContext.resume().then(() => {
          this.isReady = true;
          this.initialized = true;
          this.processPending();
        });
      }
      
      this.isReady = true;
      this.initialized = true;
      this.processPending();
      return Promise.resolve();
    } catch (err) {
      console.warn('AudioContext gagal, fallback ke vibrate', err);
      this.isReady = false;
      this.initialized = true;
      return Promise.resolve();
    }
  }

  // Proses antrian suara yang pending
  processPending() {
    while (this.pendingSounds.length > 0) {
      const sound = this.pendingSounds.shift();
      this.playSound(sound.type);
    }
  }

  // Main play function
  playSound(type = 'default', force = false) {
    // Jika belum ready, simpan ke antrian
    if (!this.isReady || !this.audioContext) {
      if (!force) {
        this.pendingSounds.push({ type });
        // Coba init ulang
        this.init();
      }
      return;
    }

    try {
      // Reset audio context jika suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const notes = this.getNotes(type);
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.3;
      gainNode.connect(this.audioContext.destination);

      notes.forEach(({ freq, duration, delay }) => {
        const osc = this.audioContext.createOscillator();
        const g = this.audioContext.createGain();
        
        osc.connect(g);
        g.connect(gainNode);
        
        osc.frequency.value = freq;
        osc.type = type === 'kas' || type === 'mading' ? 'square' : 'sine';
        
        const startTime = this.audioContext.currentTime + (delay || 0);
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });

      // Vibrate fallback
      if (navigator.vibrate) {
        const vibes = {
          kas: [150, 50, 100, 50, 200],
          mading: [100, 50, 150, 50, 100],
          absensi: [80, 40, 80, 40, 120],
          default: [100, 50, 150]
        };
        const v = vibes[type] || vibes.default;
        navigator.vibrate(v);
      }

    } catch (err) {
      console.warn('Play sound error:', err);
      // Fallback vibrate
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }

  getNotes(type) {
    const patterns = {
      kas: [
        { freq: 880, duration: 0.08, delay: 0 },
        { freq: 1100, duration: 0.08, delay: 0.1 },
        { freq: 1320, duration: 0.15, delay: 0.2 }
      ],
      mading: [
        { freq: 660, duration: 0.1, delay: 0 },
        { freq: 880, duration: 0.1, delay: 0.12 },
        { freq: 1100, duration: 0.15, delay: 0.24 }
      ],
      absensi: [
        { freq: 760, duration: 0.1, delay: 0 },
        { freq: 960, duration: 0.1, delay: 0.13 },
        { freq: 760, duration: 0.1, delay: 0.26 }
      ],
      default: [
        { freq: 760, duration: 0.1, delay: 0 },
        { freq: 960, duration: 0.12, delay: 0.13 }
      ]
    };
    return patterns[type] || patterns.default;
  }
}

// Singleton
const notifSound = new NotificationSound();

// ============================================
// UNLOCK AUDIO PADA INTERAKSI PERTAMA
// ============================================
let audioUnlocked = false;

document.addEventListener('click', function unlockAudio() {
  if (!audioUnlocked) {
    notifSound.init().then(() => {
      // Play test sound
      notifSound.playSound('default', true);
      audioUnlocked = true;
      console.log('🔊 Audio notification unlocked');
    }).catch(() => {
      audioUnlocked = true;
    });
    document.removeEventListener('click', unlockAudio);
  }
}, { once: false });

// Coba unlock juga di touchstart untuk mobile
document.addEventListener('touchstart', function unlockAudioTouch() {
  if (!audioUnlocked) {
    notifSound.init().then(() => {
      notifSound.playSound('default', true);
      audioUnlocked = true;
      console.log('🔊 Audio notification unlocked (touch)');
    }).catch(() => {
      audioUnlocked = true;
    });
    document.removeEventListener('touchstart', unlockAudioTouch);
  }
}, { once: false });

export { notifSound, audioUnlocked };