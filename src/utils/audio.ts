'use client';

// Web Audio API 8-Bit / 16-Bit Chiptune Synthesizer Engine
// Zero external files, works instantly in all modern browsers

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;
  public musicEnabled: boolean = true;
  public sfxEnabled: boolean = true;
  public musicVolume: number = 0.3;
  public sfxVolume: number = 0.5;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public init() {
    this.initCtx();
  }

  // 1. Play Tone Helper
  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.5) {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const actualVol = volume * this.sfxVolume;
      gain.gain.setValueAtTime(actualVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext blocked or not yet interacted
    }
  }

  // 2. Sound Effects
  playCardSound() {
    this.playTone(520, 'triangle', 0.08, 0.4);
    setTimeout(() => this.playTone(680, 'sine', 0.1, 0.4), 40);
  }

  playAttackSound() {
    if (!this.sfxEnabled) return;
    this.playTone(180, 'sawtooth', 0.15, 0.5);
    setTimeout(() => this.playTone(90, 'square', 0.2, 0.6), 50);
  }

  playDamageSound() {
    this.playTone(110, 'sawtooth', 0.18, 0.6);
  }

  playHealSound() {
    if (!this.sfxEnabled) return;
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.3), i * 60);
    });
  }

  playClickSound() {
    this.playTone(800, 'square', 0.04, 0.2);
  }

  playVictoryFanfare() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.5), idx * 120);
    });
  }

  playRewardSound() {
    if (!this.sfxEnabled) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.4), idx * 80);
    });
  }

  playCrackSound() {
    if (!this.sfxEnabled) return;
    this.playTone(150, 'sawtooth', 0.2, 0.7);
    setTimeout(() => this.playTone(80, 'square', 0.25, 0.8), 60);
  }

  playShieldSound() {
    if (!this.sfxEnabled) return;
    this.playTone(600, 'triangle', 0.08, 0.4);
    setTimeout(() => this.playTone(900, 'sine', 0.15, 0.5), 50);
  }

  playPoisonSound() {
    if (!this.sfxEnabled) return;
    this.playTone(320, 'sawtooth', 0.08, 0.35);
    setTimeout(() => this.playTone(280, 'sine', 0.1, 0.4), 40);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.12, 0.4), 90);
  }

  playEnergyChargeSound() {
    if (!this.sfxEnabled) return;
    [300, 420, 560, 750, 980].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.08, 0.35), idx * 40);
    });
  }

  playStrengthDrainSound() {
    if (!this.sfxEnabled) return;
    [700, 520, 380, 240, 150].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.09, 0.4), idx * 45);
    });
  }

  playTransferSound() {
    if (!this.sfxEnabled) return;
    [350, 500, 720, 580, 850].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.07, 0.35), idx * 35);
    });
  }

  playFireSound() {
    if (!this.sfxEnabled) return;
    this.playTone(380, 'sawtooth', 0.1, 0.4);
    setTimeout(() => this.playTone(520, 'square', 0.12, 0.45), 50);
    setTimeout(() => this.playTone(280, 'sawtooth', 0.15, 0.4), 100);
  }

  playNukeSound() {
    if (!this.sfxEnabled) return;
    this.playTone(90, 'sawtooth', 0.4, 0.9);
    setTimeout(() => this.playTone(60, 'square', 0.6, 1.0), 100);
    setTimeout(() => this.playTone(45, 'sawtooth', 0.8, 0.9), 250);
  }

  playStealSound() {
    if (!this.sfxEnabled) return;
    this.playTone(600, 'sine', 0.08, 0.35);
    setTimeout(() => this.playTone(450, 'sawtooth', 0.1, 0.4), 60);
    setTimeout(() => this.playTone(300, 'sine', 0.15, 0.45), 120);
  }

  playBossEncounterSound() {
    if (!this.sfxEnabled) return;
    const notes = [130, 164, 196, 120];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.45, 0.6), idx * 100);
    });
  }

  playChatPing() {
    if (!this.sfxEnabled) return;
    this.playTone(880, 'sine', 0.06, 0.3);
    setTimeout(() => this.playTone(1320, 'sine', 0.08, 0.35), 50);
  }

  playInvitePing() {
    if (!this.sfxEnabled) return;
    this.playTone(523.25, 'triangle', 0.12, 0.45);
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.45), 100);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.5), 200);
  }

  playUnstuffSound() {
    if (!this.sfxEnabled) return;
    this.playTone(200, 'sawtooth', 0.15, 0.6);
    setTimeout(() => this.playTone(120, 'square', 0.2, 0.7), 80);
    setTimeout(() => this.playTone(60, 'sawtooth', 0.3, 0.8), 160);
  }

  playDefeatSound() {
    if (!this.sfxEnabled) return;
    const notes = [440, 415.3, 392, 349.2, 293.6];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.45), idx * 140);
    });
  }

  // 3. Retro Chiptune Background Music
  startMusic() {
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.initCtx();
    this.isMusicPlaying = true;

    // A fun nostalgic 8-bit pentatonic melody loop
    const melody = [
      261.63, 329.63, 392.00, 523.25,
      392.00, 329.63, 261.63, 220.00,
      293.66, 349.23, 440.00, 587.33,
      440.00, 349.23, 293.66, 246.94
    ];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melody[noteIdx], this.ctx.currentTime);

        const vol = 0.08 * this.musicVolume;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);

        noteIdx = (noteIdx + 1) % melody.length;
      } catch {
        // Audio suspended
      }
    }, 280);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }
}

export const sound = new SoundEngine();
