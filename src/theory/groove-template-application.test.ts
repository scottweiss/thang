import { describe, it, expect } from 'vitest';
import {
  grooveGainMultiplier,
  grooveStrength,
} from './groove-template-application';

describe('grooveGainMultiplier', () => {
  it('downbeat gets boost', () => {
    const mul = grooveGainMultiplier(0, 'disco');
    expect(mul).toBeGreaterThan(1.0);
  });

  it('weak position gets reduction', () => {
    const downbeat = grooveGainMultiplier(0, 'trance');
    const weak = grooveGainMultiplier(1, 'trance');
    expect(downbeat).toBeGreaterThan(weak);
  });

  it('stays in 0.85-1.10 range', () => {
    for (let p = 0; p < 16; p++) {
      const mul = grooveGainMultiplier(p, 'disco');
      expect(mul).toBeGreaterThanOrEqual(0.85);
      expect(mul).toBeLessThanOrEqual(1.10);
    }
  });

  it('ambient has less contrast', () => {
    const discoDown = grooveGainMultiplier(0, 'disco');
    const ambientDown = grooveGainMultiplier(0, 'ambient');
    expect(Math.abs(discoDown - 1.0)).toBeGreaterThan(Math.abs(ambientDown - 1.0));
  });

  it('handles negative positions', () => {
    expect(grooveGainMultiplier(-1, 'trance')).toBe(grooveGainMultiplier(15, 'trance'));
  });
});

describe('grooveStrength', () => {
  it('disco is strongest', () => {
    expect(grooveStrength('disco')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(grooveStrength('ambient')).toBe(0.15);
  });
});
