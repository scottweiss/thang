import { describe, it, expect } from 'vitest';
import {
  intraBarDensity,
  contourStrength,
} from './intra-bar-density';

describe('intraBarDensity', () => {
  it('bar start has higher density', () => {
    const start = intraBarDensity(0, 'flim');
    const mid = intraBarDensity(0.5, 'flim');
    expect(start).toBeGreaterThanOrEqual(mid);
  });

  it('stays in 0.85-1.10 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const d = intraBarDensity(p, 'ambient');
      expect(d).toBeGreaterThanOrEqual(0.85);
      expect(d).toBeLessThanOrEqual(1.10);
    }
  });

  it('low-contour mood stays flatter', () => {
    const tranceStart = intraBarDensity(0, 'trance');
    const tranceMid = intraBarDensity(0.5, 'trance');
    const ambientStart = intraBarDensity(0, 'ambient');
    const ambientMid = intraBarDensity(0.5, 'ambient');
    expect(Math.abs(ambientStart - ambientMid)).toBeGreaterThanOrEqual(
      Math.abs(tranceStart - tranceMid)
    );
  });

  it('end of bar has slight pickup', () => {
    const late = intraBarDensity(0.95, 'avril');
    const mid = intraBarDensity(0.7, 'avril');
    expect(late).toBeGreaterThanOrEqual(mid);
  });
});

describe('contourStrength', () => {
  it('ambient is highest', () => {
    expect(contourStrength('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(contourStrength('disco')).toBe(0.20);
  });
});
