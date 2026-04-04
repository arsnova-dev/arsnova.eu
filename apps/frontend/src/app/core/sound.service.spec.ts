import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundService } from './sound.service';

describe('SoundService', () => {
  const originalAudioContext = globalThis.AudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext;
  });

  it('erlaubt einen erneuten Unlock-Versuch nach blockierter Autoplay-Freigabe', async () => {
    let resumeAttempts = 0;

    class FakeAudioContext {
      state: AudioContextState = 'suspended';

      async resume(): Promise<void> {
        resumeAttempts += 1;
        if (resumeAttempts === 1) {
          throw new Error('blocked');
        }
        this.state = 'running';
      }
    }

    globalThis.AudioContext = FakeAudioContext as unknown as typeof AudioContext;

    const service = new SoundService();

    service.unlock();
    await Promise.resolve();
    await Promise.resolve();

    expect((service as unknown as { unlocked: boolean }).unlocked).toBe(false);

    service.unlock();
    await Promise.resolve();
    await Promise.resolve();

    expect(resumeAttempts).toBe(2);
    expect((service as unknown as { unlocked: boolean }).unlocked).toBe(true);
  });
});
