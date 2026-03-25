import { describe, expect, it } from 'vitest';
import { remainingCountdownSeconds } from './session-countdown.util';

describe('remainingCountdownSeconds', () => {
  it('nutzt ceil und null nicht unter 0', () => {
    const deadline = 10_000;
    expect(remainingCountdownSeconds(deadline, 1000)).toBe(9);
    expect(remainingCountdownSeconds(deadline, 9001)).toBe(1);
    expect(remainingCountdownSeconds(deadline, 9999)).toBe(1);
    expect(remainingCountdownSeconds(deadline, 10_000)).toBe(0);
    expect(remainingCountdownSeconds(deadline, 11_000)).toBe(0);
  });
});
