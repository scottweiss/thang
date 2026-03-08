import { describe, it, expect } from 'vitest';
import {
  resolutionMomentumGain,
  driveStrength,
} from './harmonic-resolution-momentum';

describe('resolutionMomentumGain', () => {
  it('dominant chord gets highest boost', () => {
    // G (7) over C (0) = perfect fifth = dominant
    const gain = resolutionMomentumGain(7, 0, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('tonic is neutral (already resolved)', () => {
    const gain = resolutionMomentumGain(0, 0, 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril has more drive than ambient', () => {
    const avril = resolutionMomentumGain(7, 0, 'avril');
    const amb = resolutionMomentumGain(7, 0, 'ambient');
    expect(avril).toBeGreaterThan(amb);
  });

  it('pre-dominant has moderate drive', () => {
    // D (2) over C (0) = whole step = ii
    const gain = resolutionMomentumGain(2, 0, 'avril');
    expect(gain).toBeGreaterThan(1.0);
    expect(gain).toBeLessThan(resolutionMomentumGain(7, 0, 'avril'));
  });

  it('stays in 0.97-1.08 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const gain = resolutionMomentumGain(pc, 0, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('driveStrength', () => {
  it('avril is highest', () => {
    expect(driveStrength('avril')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(driveStrength('ambient')).toBe(0.15);
  });
});
