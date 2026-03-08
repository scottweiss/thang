import { describe, it, expect } from 'vitest';
import {
  anchorPointGain,
  anchorStrength,
} from './rhythmic-anchor-point';

describe('anchorPointGain', () => {
  it('downbeat gets strongest boost', () => {
    const down = anchorPointGain(0, 'trance');
    const off = anchorPointGain(3, 'trance');
    expect(down).toBeGreaterThan(off);
  });

  it('beat 3 is strong', () => {
    const beat3 = anchorPointGain(8, 'trance');
    expect(beat3).toBeGreaterThan(1.0);
  });

  it('trance anchors more than ambient', () => {
    const trance = anchorPointGain(0, 'trance');
    const amb = anchorPointGain(0, 'ambient');
    expect(trance).toBeGreaterThan(amb);
  });

  it('stays in 0.95-1.08 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = anchorPointGain(p, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.95);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('anchorStrength', () => {
  it('trance is highest', () => {
    expect(anchorStrength('trance')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(anchorStrength('ambient')).toBe(0.10);
  });
});
