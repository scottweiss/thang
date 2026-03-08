import { describe, it, expect } from 'vitest';
import {
  rootStrengthGain,
  rootSensitivity,
} from './harmonic-root-strength';

describe('rootStrengthGain', () => {
  it('root position gets boost', () => {
    // Bass C (48), chord root C (60) — same pitch class
    const gain = rootStrengthGain(48, 60, 'blockhead');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('inversion is neutral-ish', () => {
    // Bass E (52), chord root C (60) — 3rd in bass
    const gain = rootStrengthGain(52, 60, 'blockhead');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('non-chord bass gets reduction', () => {
    // Bass F# (54), chord root C (60) — tritone
    const gain = rootStrengthGain(54, 60, 'blockhead');
    expect(gain).toBeLessThan(1.0);
  });

  it('blockhead is more root-sensitive than syro', () => {
    const bh = rootStrengthGain(48, 60, 'blockhead');
    const sy = rootStrengthGain(48, 60, 'syro');
    expect(bh).toBeGreaterThan(sy);
  });

  it('stays in 0.94-1.06 range', () => {
    for (let bass = 36; bass <= 72; bass += 3) {
      const gain = rootStrengthGain(bass, 60, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('rootSensitivity', () => {
  it('blockhead is highest', () => {
    expect(rootSensitivity('blockhead')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(rootSensitivity('syro')).toBe(0.20);
  });
});
