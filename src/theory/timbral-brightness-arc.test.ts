import { describe, it, expect } from 'vitest';
import {
  brightnessArcLpf,
  arcDepth,
} from './timbral-brightness-arc';

describe('brightnessArcLpf', () => {
  it('mid-section is brighter than edges', () => {
    const mid = brightnessArcLpf(0.5, 'ambient', 'peak');
    const start = brightnessArcLpf(0.0, 'ambient', 'peak');
    expect(mid).toBeGreaterThan(start);
  });

  it('build peaks near end', () => {
    const late = brightnessArcLpf(0.8, 'lofi', 'build');
    const early = brightnessArcLpf(0.1, 'lofi', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('ambient has deeper arc than syro', () => {
    expect(arcDepth('ambient')).toBeGreaterThan(arcDepth('syro'));
  });

  it('stays in 0.80-1.15 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const lpf = brightnessArcLpf(t, 'lofi', 'peak');
      expect(lpf).toBeGreaterThanOrEqual(0.80);
      expect(lpf).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('arcDepth', () => {
  it('ambient is deepest', () => {
    expect(arcDepth('ambient')).toBe(0.65);
  });

  it('syro is shallow', () => {
    expect(arcDepth('syro')).toBe(0.30);
  });
});
