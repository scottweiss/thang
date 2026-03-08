import { describe, it, expect } from 'vitest';
import {
  consonanceLevel,
  consonanceArcFm,
  consonanceArcIntensity,
} from './consonance-arc';

describe('consonanceLevel', () => {
  it('high at phrase start', () => {
    const c = consonanceLevel(0, 'avril', 'build');
    expect(c).toBeGreaterThan(0.6);
  });

  it('dips at 60% (tension peak)', () => {
    const start = consonanceLevel(0, 'avril', 'peak');
    const mid = consonanceLevel(0.6, 'avril', 'peak');
    expect(mid).toBeLessThan(start);
  });

  it('recovers at phrase end', () => {
    const end = consonanceLevel(1.0, 'avril', 'build');
    expect(end).toBeGreaterThan(0.7);
  });

  it('avril dips more than disco', () => {
    const avril = consonanceLevel(0.6, 'avril', 'build');
    const disco = consonanceLevel(0.6, 'disco', 'build');
    expect(avril).toBeLessThan(disco);
  });

  it('stays in 0-1 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const c = consonanceLevel(p, 'ambient', 'peak');
      expect(c).toBeGreaterThanOrEqual(0.0);
      expect(c).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('consonanceArcFm', () => {
  it('more FM at tension peak', () => {
    const start = consonanceArcFm(0, 'avril', 'build');
    const peak = consonanceArcFm(0.6, 'avril', 'build');
    expect(peak).toBeGreaterThan(start);
  });

  it('stays in 0.8-1.4 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const fm = consonanceArcFm(p, 'xtal', 'peak');
      expect(fm).toBeGreaterThanOrEqual(0.8);
      expect(fm).toBeLessThanOrEqual(1.4);
    }
  });
});

describe('consonanceArcIntensity', () => {
  it('avril is highest', () => {
    expect(consonanceArcIntensity('avril')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(consonanceArcIntensity('disco')).toBe(0.20);
  });
});
