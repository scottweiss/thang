import { describe, it, expect } from 'vitest';
import {
  bassWeightGain,
  bassFoundationWeight,
} from './harmonic-bass-weight';

describe('bassWeightGain', () => {
  it('root bass gets boost', () => {
    const gain = bassWeightGain('C', 'C', 'blockhead');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-root bass gets reduction', () => {
    const gain = bassWeightGain('E', 'C', 'blockhead');
    expect(gain).toBeLessThan(1.0);
  });

  it('blockhead weights more than syro', () => {
    const bh = bassWeightGain('C', 'C', 'blockhead');
    const sy = bassWeightGain('C', 'C', 'syro');
    expect(bh).toBeGreaterThan(sy);
  });

  it('handles octave notation', () => {
    const gain = bassWeightGain('C3', 'C', 'blockhead');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('stays in 0.97-1.04 range', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    for (const n of notes) {
      const gain = bassWeightGain(n, 'C', 'blockhead');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('bassFoundationWeight', () => {
  it('blockhead is highest', () => {
    expect(bassFoundationWeight('blockhead')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(bassFoundationWeight('syro')).toBe(0.20);
  });
});
