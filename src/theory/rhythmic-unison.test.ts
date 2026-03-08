import { describe, it, expect } from 'vitest';
import {
  shouldApplyUnison,
  selectUnisonPattern,
  unisonAccentMask,
  unisonIntensity,
  unisonTendency,
} from './rhythmic-unison';

describe('shouldApplyUnison', () => {
  it('is deterministic', () => {
    const a = shouldApplyUnison(42, 'trance', 'peak', 0.5, 0.7);
    const b = shouldApplyUnison(42, 'trance', 'peak', 0.5, 0.7);
    expect(a).toBe(b);
  });

  it('peak has more unison than intro', () => {
    const peakCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'trance', 'peak', 0.1, 0.8)
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'trance', 'intro', 0.5, 0.3)
    ).filter(Boolean).length;
    expect(peakCount).toBeGreaterThan(introCount);
  });

  it('trance has more unison than ambient', () => {
    const tranceCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'trance', 'peak', 0.1, 0.7)
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'ambient', 'peak', 0.1, 0.7)
    ).filter(Boolean).length;
    expect(tranceCount).toBeGreaterThan(ambientCount);
  });

  it('high tension increases likelihood', () => {
    const highCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'avril', 'peak', 0.05, 0.95)
    ).filter(Boolean).length;
    const lowCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyUnison(i, 'avril', 'peak', 0.05, 0.1)
    ).filter(Boolean).length;
    expect(highCount).toBeGreaterThanOrEqual(lowCount);
  });
});

describe('selectUnisonPattern', () => {
  it('returns valid pattern', () => {
    const valid = ['downbeat', 'stab', 'double', 'syncopated'];
    const pattern = selectUnisonPattern(42, 'trance');
    expect(valid).toContain(pattern);
  });

  it('is deterministic', () => {
    const a = selectUnisonPattern(42, 'lofi');
    const b = selectUnisonPattern(42, 'lofi');
    expect(a).toBe(b);
  });

  it('covers all patterns across many ticks', () => {
    const patterns = new Set<string>();
    for (let i = 0; i < 200; i++) {
      patterns.add(selectUnisonPattern(i, 'downtempo'));
    }
    expect(patterns.size).toBe(4);
  });
});

describe('unisonAccentMask', () => {
  it('returns correct length', () => {
    expect(unisonAccentMask('downbeat', 16, 0.5)).toHaveLength(16);
    expect(unisonAccentMask('stab', 8, 0.5)).toHaveLength(8);
  });

  it('downbeat accents position 0', () => {
    const mask = unisonAccentMask('downbeat', 8, 0.8);
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[1]).toBeLessThan(1.0);
    expect(mask[4]).toBeLessThan(1.0);
  });

  it('stab accents positions 0 and 1', () => {
    const mask = unisonAccentMask('stab', 8, 0.8);
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[1]).toBeGreaterThan(1.0);
    expect(mask[3]).toBeLessThan(1.0);
  });

  it('double accents beats 1 and 3', () => {
    const mask = unisonAccentMask('double', 16, 0.8);
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[8]).toBeGreaterThan(1.0);
    expect(mask[4]).toBeLessThan(1.0);
  });

  it('syncopated accents last and first positions', () => {
    const mask = unisonAccentMask('syncopated', 8, 0.8);
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[7]).toBeGreaterThan(1.0);
    expect(mask[3]).toBeLessThan(1.0);
  });

  it('zero intensity returns all 1.0', () => {
    const mask = unisonAccentMask('downbeat', 8, 0);
    expect(mask.every(v => v === 1.0)).toBe(true);
  });
});

describe('unisonIntensity', () => {
  it('peak trance has high intensity', () => {
    const intensity = unisonIntensity('trance', 'peak', 0.9);
    expect(intensity).toBeGreaterThan(0.3);
  });

  it('intro ambient has low intensity', () => {
    const intensity = unisonIntensity('ambient', 'intro', 0.1);
    expect(intensity).toBeLessThan(0.1);
  });

  it('clamps to 0-1', () => {
    const intensity = unisonIntensity('trance', 'peak', 1.0);
    expect(intensity).toBeLessThanOrEqual(1.0);
    expect(intensity).toBeGreaterThanOrEqual(0.0);
  });
});

describe('unisonTendency', () => {
  it('trance has highest', () => {
    expect(unisonTendency('trance')).toBe(0.30);
  });

  it('ambient has lowest', () => {
    expect(unisonTendency('ambient')).toBe(0.02);
  });
});
