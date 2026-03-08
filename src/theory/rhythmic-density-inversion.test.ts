import { describe, it, expect } from 'vitest';
import {
  densityInversionGain,
  inversionStrength,
} from './rhythmic-density-inversion';

describe('densityInversionGain', () => {
  it('high primary density thins secondary', () => {
    const gain = densityInversionGain(0.9, 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('low primary density boosts secondary', () => {
    const gain = densityInversionGain(0.1, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('medium density is near neutral', () => {
    const gain = densityInversionGain(0.5, 'lofi');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('lofi has stronger inversion than trance', () => {
    const lofi = densityInversionGain(0.9, 'lofi');
    const trance = densityInversionGain(0.9, 'trance');
    expect(lofi).toBeLessThan(trance);
  });

  it('stays in 0.80-1.10 range', () => {
    for (let d = 0; d <= 1.0; d += 0.1) {
      const gain = densityInversionGain(d, 'lofi');
      expect(gain).toBeGreaterThanOrEqual(0.80);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('inversionStrength', () => {
  it('lofi is highest', () => {
    expect(inversionStrength('lofi')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(inversionStrength('disco')).toBe(0.30);
  });
});
