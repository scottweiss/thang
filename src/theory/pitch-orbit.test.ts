import { describe, it, expect } from 'vitest';
import {
  orbitalWeight,
  nearestStructuralDistance,
  orbitalPull,
} from './pitch-orbit';

describe('orbitalWeight', () => {
  it('unison has highest weight', () => {
    expect(orbitalWeight(0, 0, 'trance')).toBeCloseTo(1.0, 1);
  });

  it('closer notes have higher weight', () => {
    const close = orbitalWeight(1, 0, 'trance');
    const far = orbitalWeight(6, 0, 'trance');
    expect(close).toBeGreaterThan(far);
  });

  it('trance has tighter orbit than syro', () => {
    const trance = orbitalWeight(3, 0, 'trance');
    const syro = orbitalWeight(3, 0, 'syro');
    // Trance has higher pull, so non-structural note gets lower weight
    expect(trance).toBeLessThan(syro);
  });

  it('wraps around octave', () => {
    // B (11) is 1 semitone from C (0)
    const weight = orbitalWeight(11, 0, 'lofi');
    const close = orbitalWeight(1, 0, 'lofi');
    expect(weight).toBeCloseTo(close, 1);
  });

  it('stays in 0.1-1.0 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const w = orbitalWeight(pc, 0, 'ambient');
      expect(w).toBeGreaterThanOrEqual(0.1);
      expect(w).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('nearestStructuralDistance', () => {
  it('0 when on structural tone', () => {
    expect(nearestStructuralDistance(0, [0, 4, 7])).toBe(0);
  });

  it('returns min distance', () => {
    // E is 1 semitone from Eb (3)
    expect(nearestStructuralDistance(4, [0, 3, 7])).toBe(1);
  });

  it('6 for empty structural set', () => {
    expect(nearestStructuralDistance(0, [])).toBe(6);
  });

  it('wraps correctly', () => {
    // B(11) to C(0) = 1 semitone
    expect(nearestStructuralDistance(11, [0])).toBe(1);
  });
});

describe('orbitalPull', () => {
  it('trance is high', () => {
    expect(orbitalPull('trance')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(orbitalPull('syro')).toBe(0.20);
  });
});
