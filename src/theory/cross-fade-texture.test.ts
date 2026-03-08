import { describe, it, expect } from 'vitest';
import {
  crossfadeBlend,
  crossfadeFm,
  crossfadeLpf,
  shouldCrossfade,
  crossfadeSpeed,
} from './cross-fade-texture';

describe('crossfadeBlend', () => {
  it('0 immediately (tick 0)', () => {
    expect(crossfadeBlend(0, 'lofi')).toBe(0);
  });

  it('decays over ticks', () => {
    const t1 = crossfadeBlend(1, 'lofi');
    const t2 = crossfadeBlend(2, 'lofi');
    expect(t1).toBeGreaterThan(t2);
    expect(t1).toBeGreaterThan(0);
    expect(t2).toBeGreaterThan(0);
  });

  it('faster moods decay quicker', () => {
    const trance = crossfadeBlend(1, 'trance');
    const lofi = crossfadeBlend(1, 'lofi');
    expect(trance).toBeLessThan(lofi);
  });

  it('between 0 and 1', () => {
    for (let t = 0; t <= 5; t++) {
      const blend = crossfadeBlend(t, 'ambient');
      expect(blend).toBeGreaterThanOrEqual(0);
      expect(blend).toBeLessThanOrEqual(1);
    }
  });
});

describe('crossfadeFm', () => {
  it('returns newFm when blend is 0', () => {
    expect(crossfadeFm(1.5, 2.0, 0)).toBe(2.0);
  });

  it('returns oldFm when blend is 1', () => {
    expect(crossfadeFm(1.5, 2.0, 1)).toBe(1.5);
  });

  it('interpolates at blend 0.5', () => {
    expect(crossfadeFm(1.0, 3.0, 0.5)).toBe(2.0);
  });
});

describe('crossfadeLpf', () => {
  it('returns newLpf when blend is 0', () => {
    expect(crossfadeLpf(2000, 3000, 0)).toBe(3000);
  });

  it('returns oldLpf when blend is 1', () => {
    expect(crossfadeLpf(2000, 3000, 1)).toBe(2000);
  });

  it('rounds to integer', () => {
    const result = crossfadeLpf(2000, 3000, 0.3);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('shouldCrossfade', () => {
  it('false at tick 0', () => {
    expect(shouldCrossfade(0, 'lofi')).toBe(false);
  });

  it('true at tick 1-3 for slow moods', () => {
    expect(shouldCrossfade(1, 'lofi')).toBe(true);
    expect(shouldCrossfade(3, 'ambient')).toBe(true);
  });

  it('false after 3 ticks', () => {
    expect(shouldCrossfade(4, 'lofi')).toBe(false);
  });
});

describe('crossfadeSpeed', () => {
  it('ambient is slowest', () => {
    expect(crossfadeSpeed('ambient')).toBe(0.60);
  });

  it('trance is fastest', () => {
    expect(crossfadeSpeed('trance')).toBe(0.15);
  });
});
