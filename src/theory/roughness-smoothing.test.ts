import { describe, it, expect } from 'vitest';
import {
  pairRoughness,
  totalRoughness,
  roughnessGainReduction,
  shouldSmoothRoughness,
  roughnessTolerance,
} from './roughness-smoothing';

describe('pairRoughness', () => {
  it('unison has no roughness', () => {
    expect(pairRoughness(60, 60)).toBe(0);
  });

  it('semitone has high roughness', () => {
    const r = pairRoughness(60, 61); // C4 - C#4
    expect(r).toBeGreaterThan(0.3);
  });

  it('octave has no roughness', () => {
    const r = pairRoughness(60, 72); // C4 - C5
    expect(r).toBeLessThan(0.01);
  });

  it('perfect 5th has low roughness', () => {
    const r = pairRoughness(60, 67); // C4 - G4
    expect(r).toBeLessThan(0.1);
  });

  it('minor 2nd is rougher than major 3rd', () => {
    const m2 = pairRoughness(60, 61);
    const M3 = pairRoughness(60, 64);
    expect(m2).toBeGreaterThan(M3);
  });
});

describe('totalRoughness', () => {
  it('single note = no roughness', () => {
    expect(totalRoughness([60])).toBe(0);
  });

  it('empty = no roughness', () => {
    expect(totalRoughness([])).toBe(0);
  });

  it('cluster chord is rough', () => {
    const r = totalRoughness([60, 61, 62]); // C-Db-D cluster
    expect(r).toBeGreaterThan(0.2);
  });

  it('open voicing is less rough', () => {
    const cluster = totalRoughness([60, 61, 62]);
    const open = totalRoughness([48, 60, 72]); // octaves
    expect(open).toBeLessThan(cluster);
  });
});

describe('roughnessGainReduction', () => {
  it('no reduction below tolerance', () => {
    expect(roughnessGainReduction(0.1, 'syro')).toBe(1.0); // syro tolerance = 0.55
  });

  it('reduces gain above tolerance', () => {
    expect(roughnessGainReduction(0.5, 'ambient')).toBeLessThan(1.0); // ambient tolerance = 0.15
  });

  it('clamped at 0.8', () => {
    expect(roughnessGainReduction(1.0, 'ambient')).toBeGreaterThanOrEqual(0.8);
  });
});

describe('shouldSmoothRoughness', () => {
  it('ambient applies', () => {
    expect(shouldSmoothRoughness('ambient')).toBe(true);
  });

  it('syro applies (tolerance < 0.60)', () => {
    expect(shouldSmoothRoughness('syro')).toBe(true);
  });
});

describe('roughnessTolerance', () => {
  it('syro is most tolerant', () => {
    expect(roughnessTolerance('syro')).toBe(0.55);
  });

  it('ambient is least tolerant', () => {
    expect(roughnessTolerance('ambient')).toBe(0.15);
  });
});
