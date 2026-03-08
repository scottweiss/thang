import { describe, it, expect } from 'vitest';
import {
  microPauseGain,
  pauseDepth,
} from './micro-pause-anticipation';

describe('microPauseGain', () => {
  it('before downbeat has deepest pause', () => {
    const beforeDown = microPauseGain(15, 'lofi');
    const onBeat = microPauseGain(0, 'lofi');
    expect(beforeDown).toBeLessThan(onBeat);
  });

  it('non-pause positions return 1.0', () => {
    expect(microPauseGain(0, 'ambient')).toBe(1.0);
    expect(microPauseGain(4, 'ambient')).toBe(1.0);
  });

  it('stays in 0.85-1.0 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = microPauseGain(p, 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.85);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });

  it('deeper mood has more pause', () => {
    const ambient = microPauseGain(15, 'ambient');
    const trance = microPauseGain(15, 'trance');
    expect(ambient).toBeLessThan(trance); // ambient pauses more
  });

  it('before backbeat has moderate pause', () => {
    const beforeBack = microPauseGain(7, 'lofi');
    const beforeDown = microPauseGain(15, 'lofi');
    expect(beforeBack).toBeGreaterThan(beforeDown); // less pause than downbeat
    expect(beforeBack).toBeLessThan(1.0); // but still some pause
  });
});

describe('pauseDepth', () => {
  it('ambient is deepest', () => {
    expect(pauseDepth('ambient')).toBe(0.60);
  });

  it('trance is shallow', () => {
    expect(pauseDepth('trance')).toBe(0.15);
  });
});
