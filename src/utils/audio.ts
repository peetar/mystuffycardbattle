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

  playAchievementSound() {
    if (!this.sfxEnabled) return;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    fanfare.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.5), idx * 70);
    });
  }

  playUndoSound() {
    if (!this.sfxEnabled) return;
    this.playTone(700, 'sine', 0.05, 0.3);
    setTimeout(() => this.playTone(480, 'triangle', 0.08, 0.35), 40);
    setTimeout(() => this.playTone(320, 'sine', 0.1, 0.35), 80);
  }

  playConcussionSound() {
    if (!this.sfxEnabled) return;
    [260, 240, 290, 210, 310, 180].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.08, 0.4), idx * 50);
    });
  }

  playReinforceSound() {
    if (!this.sfxEnabled) return;
    [440, 554, 880, 1108].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.1, 0.35), idx * 60);
    });
  }

  playRestSound() {
    if (!this.sfxEnabled) return;
    [329.63, 392.0, 493.88, 659.25].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.3), idx * 100);
    });
  }

  playClawSlashSound() {
    if (!this.sfxEnabled) return;
    this.playTone(650, 'sawtooth', 0.06, 0.45);
    setTimeout(() => this.playTone(920, 'sawtooth', 0.08, 0.5), 30);
    setTimeout(() => this.playTone(340, 'square', 0.1, 0.55), 70);
  }

  playLaserShootSound() {
    if (!this.sfxEnabled) return;
    this.playTone(880, 'sine', 0.05, 0.4);
    setTimeout(() => this.playTone(620, 'triangle', 0.06, 0.45), 30);
    setTimeout(() => this.playTone(310, 'sawtooth', 0.09, 0.5), 60);
    setTimeout(() => this.playTone(150, 'sine', 0.12, 0.4), 100);
  }

  playFartSound() {
    if (!this.sfxEnabled) return;
    const freqs = [110, 85, 120, 75, 95, 60, 48];
    freqs.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, idx % 2 === 0 ? 'sawtooth' : 'square', 0.07, 0.55), idx * 25);
    });
  }

  playPunchyHitSound() {
    if (!this.sfxEnabled) return;
    this.playTone(180, 'square', 0.05, 0.7);
    setTimeout(() => this.playTone(70, 'sawtooth', 0.18, 0.8), 25);
  }

  playWhooshSound() {
    if (!this.sfxEnabled) return;
    this.playTone(300, 'sine', 0.06, 0.3);
    setTimeout(() => this.playTone(480, 'triangle', 0.08, 0.35), 30);
    setTimeout(() => this.playTone(200, 'sine', 0.1, 0.3), 70);
  }

  // 3. Hybrid Acoustic + Chiptune + Orchestral Background Music Engine (v4.6)
  private currentScene: string = 'title';

  private sceneTracks: Record<string, { melody: number[]; harmony: number[]; bass: number[]; tempo: number }> = {
    title: {
      // Warm C Major with acoustic marimba & chiptune arpeggio
      melody: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 440.0, 587.33, 698.46, 880.0, 1174.66, 880.0, 698.46, 587.33, 493.88],
      harmony: [261.63, 329.63, 392.0, 329.63, 261.63, 220.0, 293.66, 246.94],
      bass: [130.81, 130.81, 110.0, 123.47],
      tempo: 220,
    },
    map: {
      // Storybook stroll with cozy acoustic warmth
      melody: [440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 440.0, 392.0, 440.0, 587.33, 698.46, 880.0, 698.46, 587.33],
      harmony: [220.0, 261.63, 329.63, 261.63, 220.0, 196.0, 220.0, 293.66],
      bass: [110.0, 110.0, 98.0, 110.0],
      tempo: 280,
    },
    battle: {
      // High-energy combat: punchy chiptune lead + acoustic marimba + orchestral bass drive
      melody: [329.63, 392.0, 440.0, 493.88, 659.25, 587.33, 493.88, 440.0, 392.0, 440.0, 493.88, 659.25, 783.99, 659.25],
      harmony: [164.81, 196.0, 220.0, 246.94, 329.63, 293.66, 246.94, 220.0],
      bass: [82.41, 82.41, 110.0, 123.47],
      tempo: 175,
    },
    elite: {
      // Intense minor battle: brass stabs + rapid synth runs
      melody: [261.63, 311.13, 349.23, 392.0, 440.0, 392.0, 349.23, 311.13, 261.63, 293.66, 349.23, 415.3],
      harmony: [130.81, 155.56, 174.61, 196.0, 220.0, 196.0, 174.61, 155.56],
      bass: [65.41, 77.78, 87.31, 98.0],
      tempo: 160,
    },
    boss: {
      // Epic Colossal Boss: Deep orchestral sawtooth horns + ominous chiptune polyphony
      melody: [220.0, 261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 196.0, 220.0, 261.63, 293.66, 329.63, 246.94],
      harmony: [110.0, 130.81, 146.83, 164.81, 196.0, 164.81, 146.83, 130.81],
      bass: [55.0, 65.41, 73.42, 82.41],
      tempo: 165,
    },
    merchant: {
      // Upbeat carnival marimba shop theme
      melody: [659.25, 783.99, 880.0, 1046.5, 987.77, 880.0, 783.99, 698.46, 659.25, 783.99, 880.0, 1046.5],
      harmony: [329.63, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0, 349.23],
      bass: [164.81, 196.0, 220.0, 196.0],
      tempo: 210,
    },
    rest: {
      // Gentle lullaby campfire: acoustic acoustic sine chimes
      melody: [392.0, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 440.0, 523.25, 659.25, 783.99],
      harmony: [196.0, 246.94, 293.66, 392.0, 329.63, 293.66, 246.94, 220.0],
      bass: [98.0, 123.47, 146.83, 130.81],
      tempo: 360,
    },
    event: {
      // Mystical story encounter
      melody: [523.25, 622.25, 783.99, 932.33, 1046.5, 932.33, 783.99, 622.25],
      harmony: [261.63, 311.13, 392.0, 466.16, 523.25, 466.16, 392.0, 311.13],
      bass: [130.81, 155.56, 196.0, 155.56],
      tempo: 260,
    },
    victory: {
      // Triumphant fanfare chord progression
      melody: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0],
      harmony: [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5],
      bass: [130.81, 164.81, 196.0, 261.63],
      tempo: 140,
    },
  };

  playSceneMusic(scene: 'title' | 'map' | 'battle' | 'elite' | 'boss' | 'merchant' | 'rest' | 'event' | 'victory') {
    if (this.currentScene === scene && this.isMusicPlaying) return;
    this.currentScene = scene;
    if (this.musicEnabled) {
      this.stopMusic();
      this.startMusic();
    }
  }

  startMusic() {
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.initCtx();
    this.isMusicPlaying = true;

    const track = this.sceneTracks[this.currentScene] || this.sceneTracks.title;
    const melody = track.melody;
    const harmony = track.harmony;
    const bass = track.bass;
    let stepIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const stepTime = this.ctx.currentTime;
        const dur = (track.tempo / 1000) * 0.9;

        // 1. Voice 1: Chiptune 16-Bit Lead (Triangle / Pulse)
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = this.currentScene === 'boss' ? 'square' : 'triangle';
        leadOsc.frequency.setValueAtTime(melody[stepIdx % melody.length], stepTime);
        const leadVol = 0.05 * this.musicVolume;
        leadGain.gain.setValueAtTime(leadVol, stepTime);
        leadGain.gain.exponentialRampToValueAtTime(0.001, stepTime + dur);
        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(stepTime);
        leadOsc.stop(stepTime + dur);

        // 2. Voice 2: Acoustic Marimba / Kalimba Pluck (Sine harmonic)
        const harmOsc = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(harmony[Math.floor(stepIdx / 2) % harmony.length], stepTime);
        const harmVol = 0.04 * this.musicVolume;
        harmGain.gain.setValueAtTime(harmVol, stepTime);
        harmGain.gain.exponentialRampToValueAtTime(0.0005, stepTime + (dur * 0.8));
        harmOsc.connect(harmGain);
        harmGain.connect(this.ctx.destination);
        harmOsc.start(stepTime);
        harmOsc.stop(stepTime + (dur * 0.8));

        // 3. Voice 3: Orchestral Brass / Sub-Bass (Low octave warmth)
        if (stepIdx % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = (this.currentScene === 'boss' || this.currentScene === 'elite') ? 'sawtooth' : 'triangle';
          bassOsc.frequency.setValueAtTime(bass[Math.floor(stepIdx / 4) % bass.length], stepTime);
          const bassVol = 0.035 * this.musicVolume;
          bassGain.gain.setValueAtTime(bassVol, stepTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, stepTime + (dur * 3.5));
          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(stepTime);
          bassOsc.stop(stepTime + (dur * 3.5));
        }

        stepIdx = (stepIdx + 1) % 64;
      } catch {
        // Audio suspended
      }
    }, track.tempo);
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
