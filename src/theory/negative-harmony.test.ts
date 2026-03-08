import { describe, it, expect } from 'vitest';
import {
  mirrorPitch,
  negativeRoot,
  negativeVoicing,
  shouldApplyNegativeHarmony,
  negativeTendency,
} from './negative-harmony';

describe('mirrorPitch', () => {
  it('mirrors C around C axis to get G', () => {
    // C(0) mirrored around axis at 3.5 → 2*3.5 - 0 = 7 = G
    expect(mirrorPitch(0, 0)).toBe(7);
  });

  it('mirrors G around C axis to get C', () => {
    // G(7) mirrored around axis at 3.5 → 2*3.5 - 7 = 0 = C
    expect(mirrorPitch(7, 0)).toBe(0);
  });

  it('mirrors E around C axis to get Eb', () => {
    // E(4) mirrored → 2*3.5 - 4 = 3 = Eb
    expect(mirrorPitch(4, 0)).toBe(3);
  });

  it('mirrors D around C axis to get F', () => {
    // D(2) mirrored → 2*3.5 - 2 = 5 = F
    expect(mirrorPitch(2, 0)).toBe(5);
  });

  it('always returns 0-11', () => {
    for (let i = 0; i < 12; i++) {
      const result = mirrorPitch(i, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(11);
    }
  });
});

describe('negativeRoot', () => {
  it('C becomes G in key of C', () => {
    expect(negativeRoot('C', 'C')).toBe('G');
  });

  it('G becomes C in key of C', () => {
    expect(negativeRoot('G', 'C')).toBe('C');
  });

  it('D becomes F in key of C', () => {
    expect(negativeRoot('D', 'C')).toBe('F');
  });
});

describe('negativeVoicing', () => {
  it('mirrors a C major triad', () => {
    const result = negativeVoicing(['C3', 'E3', 'G3'], 'C');
    // C→G, E→Eb, G→C (with octave adjustments)
    const pcs = result.map(n => n.replace(/[0-9]/g, ''));
    expect(pcs).toContain('G');
    expect(pcs).toContain('Eb');
    expect(pcs).toContain('C');
  });

  it('preserves array length', () => {
    const result = negativeVoicing(['C3', 'E3', 'G3', 'B3'], 'C');
    expect(result).toHaveLength(4);
  });

  it('handles single note', () => {
    const result = negativeVoicing(['D4'], 'C');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/^[A-G]/);
  });
});

describe('shouldApplyNegativeHarmony', () => {
  it('is deterministic', () => {
    const a = shouldApplyNegativeHarmony(5, 'lofi', 'groove');
    const b = shouldApplyNegativeHarmony(5, 'lofi', 'groove');
    expect(a).toBe(b);
  });

  it('breakdown has more negative harmony than intro', () => {
    const breakdownCount = Array.from({ length: 100 }, (_, i) =>
      shouldApplyNegativeHarmony(i, 'lofi', 'breakdown')
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 100 }, (_, i) =>
      shouldApplyNegativeHarmony(i, 'lofi', 'intro')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThanOrEqual(introCount);
  });
});

describe('negativeTendency', () => {
  it('syro has highest tendency', () => {
    expect(negativeTendency('syro')).toBe(0.25);
  });

  it('trance has lowest tendency', () => {
    expect(negativeTendency('trance')).toBe(0.03);
  });
});
