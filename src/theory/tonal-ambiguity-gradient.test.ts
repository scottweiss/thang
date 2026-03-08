import { describe, it, expect } from 'vitest';
import {
  fifthsDistance,
  ambiguityReverbMultiplier,
  ambiguitySensitivity,
} from './tonal-ambiguity-gradient';

describe('fifthsDistance', () => {
  it('same note is 0', () => {
    expect(fifthsDistance(0, 0)).toBe(0);
  });

  it('perfect fifth is 1', () => {
    expect(fifthsDistance(0, 7)).toBe(1); // C to G
  });

  it('tritone is furthest (6)', () => {
    expect(fifthsDistance(0, 6)).toBe(6); // C to F#
  });

  it('is symmetric', () => {
    expect(fifthsDistance(2, 9)).toBe(fifthsDistance(9, 2));
  });

  it('stays in 0-6 range', () => {
    for (let i = 0; i < 12; i++) {
      const d = fifthsDistance(0, i);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
});

describe('ambiguityReverbMultiplier', () => {
  it('tonic has no boost', () => {
    const mul = ambiguityReverbMultiplier(0, 0, 'ambient');
    expect(mul).toBeCloseTo(1.0, 1);
  });

  it('distant chord gets more reverb', () => {
    const close = ambiguityReverbMultiplier(7, 0, 'lofi'); // G (fifth)
    const far = ambiguityReverbMultiplier(6, 0, 'lofi');   // F# (tritone)
    expect(far).toBeGreaterThan(close);
  });

  it('stays in 0.9-1.3 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const mul = ambiguityReverbMultiplier(pc, 0, 'ambient');
      expect(mul).toBeGreaterThanOrEqual(0.9);
      expect(mul).toBeLessThanOrEqual(1.3);
    }
  });
});

describe('ambiguitySensitivity', () => {
  it('ambient is highest', () => {
    expect(ambiguitySensitivity('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(ambiguitySensitivity('disco')).toBe(0.20);
  });
});
