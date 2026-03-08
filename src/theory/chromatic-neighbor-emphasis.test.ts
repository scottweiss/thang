import { describe, it, expect } from 'vitest';
import {
  chromaticNeighborFm,
  chromaticEmphasis,
} from './chromatic-neighbor-emphasis';

describe('chromaticNeighborFm', () => {
  it('chromatic neighbor gets FM boost', () => {
    // C#(1) is chromatic neighbor to C(0) chord
    const fm = chromaticNeighborFm(1, [0, 4, 7], 'lofi');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('chord tone returns 1.0', () => {
    // C(0) is a chord tone
    const fm = chromaticNeighborFm(0, [0, 4, 7], 'lofi');
    expect(fm).toBe(1.0);
  });

  it('distant non-chord tone returns 1.0', () => {
    // A(9) is 2+ semitones from all C major chord tones (C=0, E=4, G=7)
    const fm = chromaticNeighborFm(9, [0, 4, 7], 'lofi');
    expect(fm).toBe(1.0);
  });

  it('syro emphasizes more than trance', () => {
    const syro = chromaticNeighborFm(1, [0, 4, 7], 'syro');
    const trance = chromaticNeighborFm(1, [0, 4, 7], 'trance');
    expect(syro).toBeGreaterThan(trance);
  });

  it('stays in 1.0-1.15 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const fm = chromaticNeighborFm(pc, [0, 4, 7], 'syro');
      expect(fm).toBeGreaterThanOrEqual(1.0);
      expect(fm).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('chromaticEmphasis', () => {
  it('syro is highest', () => {
    expect(chromaticEmphasis('syro')).toBe(0.65);
  });

  it('disco is low', () => {
    expect(chromaticEmphasis('disco')).toBe(0.20);
  });
});
