import { describe, it, expect } from 'vitest';
import {
  spacingQuality,
  spacingGainCorrection,
  spacingStrictness,
} from './voice-spacing-quality';

describe('spacingQuality', () => {
  it('well-spaced voicing scores high', () => {
    const score = spacingQuality([40, 52, 60, 67]); // wide bass, close treble
    expect(score).toBeGreaterThan(0.5);
  });

  it('clustered bass scores lower', () => {
    const good = spacingQuality([40, 52, 64]);
    const tight = spacingQuality([40, 42, 44]);
    expect(good).toBeGreaterThan(tight);
  });

  it('single note returns 0.5', () => {
    expect(spacingQuality([60])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = spacingQuality([36, 37, 38, 39]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('spacingGainCorrection', () => {
  it('stays in 0.90-1.08 range', () => {
    const gain = spacingGainCorrection([40, 52, 64], 'avril');
    expect(gain).toBeGreaterThanOrEqual(0.90);
    expect(gain).toBeLessThanOrEqual(1.08);
  });

  it('strict mood has more effect', () => {
    const notes = [40, 52, 64]; // good spacing
    const avril = spacingGainCorrection(notes, 'avril');
    const syro = spacingGainCorrection(notes, 'syro');
    expect(Math.abs(avril - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('spacingStrictness', () => {
  it('avril is strictest', () => {
    expect(spacingStrictness('avril')).toBe(0.60);
  });

  it('syro is least strict', () => {
    expect(spacingStrictness('syro')).toBe(0.20);
  });
});
