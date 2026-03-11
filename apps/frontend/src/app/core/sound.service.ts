import { Injectable, signal } from '@angular/core';

export type SoundKey =
  | 'sessionEnd'
  | 'questionStart'
  | 'countdownTick'
  | 'countdownEnd';

const SOUND_PATHS: Record<SoundKey, string> = {
  sessionEnd: 'assets/sound/countdownEnd/Song0.mp3',
  questionStart: 'assets/sound/connecting/Song0.mp3',
  countdownTick: 'assets/sound/countdownRunning/Song0.mp3',
  countdownEnd: 'assets/sound/countdownEnd/Song1.mp3',
};

export type MusicTrack = 'CALM_LOFI' | 'UPBEAT' | 'EPIC' | 'CHILL';

const MUSIC_PATHS: Record<MusicTrack, string> = {
  CALM_LOFI: 'assets/sound/lobby/Song0.mp3',
  UPBEAT: 'assets/sound/lobby/Song1.mp3',
  EPIC: 'assets/sound/lobby/Song2.mp3',
  CHILL: 'assets/sound/lobby/Song3.mp3',
};

/**
 * Zentraler Audio-Service (Story 5.1). Nutzt die Web Audio API und
 * respektiert die Browser-Autoplay-Policy: Audio-Context wird erst
 * nach dem ersten User-Gesture (click/keydown) aktiviert.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private unlocked = false;

  /** Alle aktiven Sound-Effekt-Nodes (damit sie gestoppt werden können). */
  private readonly activeSfxNodes = new Set<AudioBufferSourceNode>();

  /** Story 5.3: Hintergrundmusik */
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicGeneration = 0;
  private readonly activeMusicNodes = new Set<AudioBufferSourceNode>();
  readonly musicPlaying = signal(false);
  readonly musicVolume = signal(80);

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  unlock(): void {
    if (this.unlocked) return;
    const ctx = this.getContext();
    if (ctx?.state === 'suspended') {
      void ctx.resume();
    }
    this.unlocked = true;
  }

  async play(key: SoundKey): Promise<void> {
    const ctx = this.getContext();
    if (!ctx || ctx.state === 'suspended') return;

    const path = SOUND_PATHS[key];
    if (!path) return;

    let buffer = this.buffers.get(path);
    if (!buffer) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(path, buffer);
      } catch {
        return;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    this.activeSfxNodes.add(source);
    source.onended = () => this.activeSfxNodes.delete(source);
  }

  /** Stoppt alle laufenden Sound-Effekte sofort. */
  stopAllSfx(): void {
    for (const node of this.activeSfxNodes) {
      try { node.stop(); node.disconnect(); } catch { /* already stopped */ }
    }
    this.activeSfxNodes.clear();
  }

  /**
   * Story 5.3: Hintergrundmusik starten (Loop). Nur Host/Beamer.
   * Nutzt eine Generation-ID und ein Set aller aktiven Nodes,
   * um Race-Conditions und verwaiste Sources zu verhindern.
   */
  async playMusic(track: MusicTrack): Promise<void> {
    this.stopMusic();
    const gen = ++this.musicGeneration;
    const ctx = this.getContext();
    if (!ctx || ctx.state === 'suspended') return;

    const path = MUSIC_PATHS[track];
    if (!path) return;

    let buffer = this.buffers.get(path);
    if (!buffer) {
      try {
        const response = await fetch(path);
        if (this.musicGeneration !== gen) return;
        const arrayBuffer = await response.arrayBuffer();
        if (this.musicGeneration !== gen) return;
        buffer = await ctx.decodeAudioData(arrayBuffer);
        if (this.musicGeneration !== gen) return;
        this.buffers.set(path, buffer);
      } catch {
        return;
      }
    }

    if (this.musicGeneration !== gen) return;

    const gain = ctx.createGain();
    gain.gain.value = this.musicVolume() / 100;
    gain.connect(ctx.destination);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(0);

    this.activeMusicNodes.add(source);
    source.onended = () => {
      this.activeMusicNodes.delete(source);
      if (this.musicSource === source) {
        this.musicSource = null;
        this.musicGain = null;
        this.musicPlaying.set(false);
      }
    };

    this.musicSource = source;
    this.musicGain = gain;
    this.musicPlaying.set(true);
  }

  stopMusic(): void {
    this.musicGeneration++;
    for (const node of this.activeMusicNodes) {
      try { node.stop(); node.disconnect(); } catch { /* already stopped */ }
    }
    this.activeMusicNodes.clear();
    if (this.musicGain) {
      try { this.musicGain.disconnect(); } catch { /* noop */ }
    }
    this.musicSource = null;
    this.musicGain = null;
    this.musicPlaying.set(false);
  }

  /** Stoppt ALLES – Sound-Effekte und Musik. */
  stopAll(): void {
    this.stopAllSfx();
    this.stopMusic();
  }

  setMusicVolume(percent: number): void {
    const clamped = Math.max(0, Math.min(100, percent));
    this.musicVolume.set(clamped);
    if (this.musicGain) {
      this.musicGain.gain.value = clamped / 100;
    }
  }
}
