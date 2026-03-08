import { describe, it, expect } from 'vitest';
import {
  frequencyOverlap,
  blendLpfCorrection,
  blendSensitivity,
} from './spectral-blend';

describe('frequencyOverlap', () => {
  it('same layer has maximum overlap', () => {
    expect(frequencyOverlap('melody', 'melody')).toBeCloseTo(1.0, 1);
  });

  it('melody and arp overlap significantly', () => {
    const overlap = frequencyOverlap('melody', 'arp');
    expect(overlap).toBeGreaterThan(0.5);
  });

  it('drone and texture have low overlap', () => {
    const overlap = frequencyOverlap('drone', 'texture');
    expect(overlap).toBeLessThan(0.2);
  });

  it('stays in 0-1 range', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const a of layers) {
      for (const b of layers) {
        const o = frequencyOverlap(a, b);
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('blendLpfCorrection', () => {
  it('near 1.0 when alone', () => {
    expect(blendLpfCorrection('melody', ['melody'], 'xtal')).toBe(1.0);
  });

  it('adjusts when overlapping layers present', () => {
    const correction = blendLpfCorrection('melody', ['melody', 'arp', 'harmony'], 'xtal');
    expect(correction).not.toBe(1.0);
  });

  it('stays in 0.8-1.1 range', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const l of layers) {
      const c = blendLpfCorrection(l, layers, 'ambient');
      expect(c).toBeGreaterThanOrEqual(0.8);
      expect(c).toBeLessThanOrEqual(1.1);
    }
  });
});

describe('blendSensitivity', () => {
  it('xtal is highest', () => {
    expect(blendSensitivity('xtal')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(blendSensitivity('ambient')).toBe(0.25);
  });
});
