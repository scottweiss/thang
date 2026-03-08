import { describe, it, expect } from 'vitest';
import {
  harmonicRhythmVariance,
  varianceIntensity,
} from './harmonic-rhythm-variance';

describe('harmonicRhythmVariance', () => {
  it('start of section is near 1.0', () => {
    const mul = harmonicRhythmVariance(0, 'ambient', 'groove');
    expect(mul).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.6-1.5 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const mul = harmonicRhythmVariance(p, 'ambient', 'breakdown');
      expect(mul).toBeGreaterThanOrEqual(0.6);
      expect(mul).toBeLessThanOrEqual(1.5);
    }
  });

  it('varies through the section', () => {
    const start = harmonicRhythmVariance(0, 'lofi', 'build');
    const mid = harmonicRhythmVariance(0.25, 'lofi', 'build');
    expect(start).not.toBeCloseTo(mid, 1);
  });

  it('low-variance mood stays closer to 1.0', () => {
    const trance = harmonicRhythmVariance(0.25, 'trance', 'groove');
    const ambient = harmonicRhythmVariance(0.25, 'ambient', 'groove');
    expect(Math.abs(trance - 1.0)).toBeLessThan(Math.abs(ambient - 1.0));
  });
});

describe('varianceIntensity', () => {
  it('ambient is highest', () => {
    expect(varianceIntensity('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(varianceIntensity('disco')).toBe(0.15);
  });
});
