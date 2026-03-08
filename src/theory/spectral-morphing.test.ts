import { describe, it, expect } from 'vitest';
import {
  morphProgress,
  morphedLpf,
  morphSpeed,
} from './spectral-morphing';

describe('morphProgress', () => {
  it('starts at 0', () => {
    expect(morphProgress(0, 'lofi')).toBeCloseTo(0, 1);
  });

  it('approaches 1.0 at end', () => {
    expect(morphProgress(1.0, 'disco')).toBeGreaterThan(0.9);
  });

  it('disco morphs faster than ambient', () => {
    const disco = morphProgress(0.3, 'disco');
    const ambient = morphProgress(0.3, 'ambient');
    expect(disco).toBeGreaterThan(ambient);
  });

  it('stays in 0-1 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const m = morphProgress(p, 'xtal');
      expect(m).toBeGreaterThanOrEqual(0.0);
      expect(m).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('morphedLpf', () => {
  it('peak section stays bright', () => {
    const lpf = morphedLpf(2000, 'peak', 'lofi', 1.0);
    expect(lpf).toBeCloseTo(2000, -2);
  });

  it('breakdown darkens', () => {
    const lpf = morphedLpf(2000, 'breakdown', 'lofi', 1.0);
    expect(lpf).toBeLessThan(2000);
  });

  it('early in section stays near base', () => {
    const lpf = morphedLpf(2000, 'breakdown', 'ambient', 0.01);
    expect(lpf).toBeCloseTo(2000, -2);
  });
});

describe('morphSpeed', () => {
  it('disco is fast', () => {
    expect(morphSpeed('disco')).toBe(0.60);
  });

  it('ambient is slowest', () => {
    expect(morphSpeed('ambient')).toBe(0.20);
  });
});
