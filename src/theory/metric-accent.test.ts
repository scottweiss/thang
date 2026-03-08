import { describe, it, expect } from 'vitest';
import { moodAccentProfile, applyAccentProfile, accentGainPattern } from './metric-accent';

describe('moodAccentProfile', () => {
  it('disco emphasizes beats 2 & 4 (indices 2, 6)', () => {
    const p = moodAccentProfile('disco');
    expect(p.weights[2]).toBeGreaterThan(p.weights[0]); // beat 2 > beat 1
    expect(p.weights[6]).toBeGreaterThan(p.weights[4]); // beat 4 > beat 3
  });

  it('trance has strongest downbeat', () => {
    const p = moodAccentProfile('trance');
    const max = Math.max(...p.weights);
    expect(p.weights[0]).toBe(max);
  });

  it('ambient has nearly flat weights', () => {
    const p = moodAccentProfile('ambient');
    const min = Math.min(...p.weights);
    const max = Math.max(...p.weights);
    expect(max - min).toBeLessThan(0.1);
  });

  it('ambient has low strength', () => {
    expect(moodAccentProfile('ambient').strength).toBeLessThan(0.3);
  });

  it('trance has high strength', () => {
    expect(moodAccentProfile('trance').strength).toBeGreaterThan(0.6);
  });

  it('blockhead emphasizes 1 & 3 (boom-bap)', () => {
    const p = moodAccentProfile('blockhead');
    expect(p.weights[0]).toBeGreaterThan(1.1); // beat 1
    expect(p.weights[4]).toBeGreaterThan(1.1); // beat 3
    expect(p.weights[1]).toBeLessThan(0.8);    // ghost between
  });

  it('syro has irregular pattern', () => {
    const p = moodAccentProfile('syro');
    // Not monotonically increasing or decreasing
    const diffs = p.weights.slice(1).map((w, i) => w - p.weights[i]);
    const hasPositive = diffs.some(d => d > 0);
    const hasNegative = diffs.some(d => d < 0);
    expect(hasPositive && hasNegative).toBe(true);
  });

  it('all weights between 0.7 and 1.3', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const p = moodAccentProfile(mood);
      expect(p.weights.length).toBe(8);
      for (const w of p.weights) {
        expect(w).toBeGreaterThanOrEqual(0.7);
        expect(w).toBeLessThanOrEqual(1.3);
      }
      expect(p.strength).toBeGreaterThanOrEqual(0);
      expect(p.strength).toBeLessThanOrEqual(1);
    }
  });
});

describe('applyAccentProfile', () => {
  it('preserves length', () => {
    const gains = [0.1, 0.1, 0.1, 0.1];
    const profile = moodAccentProfile('trance');
    const result = applyAccentProfile(gains, profile);
    expect(result.length).toBe(4);
  });

  it('strength=0 returns unchanged gains', () => {
    const gains = [0.5, 0.5, 0.5, 0.5];
    const result = applyAccentProfile(gains, { weights: [1.2, 0.8, 1.2, 0.8], strength: 0 });
    expect(result[0]).toBeCloseTo(0.5, 4);
    expect(result[1]).toBeCloseTo(0.5, 4);
  });

  it('strength=1 applies full weight', () => {
    const gains = [1.0, 1.0];
    const result = applyAccentProfile(gains, { weights: [1.2, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], strength: 1.0 });
    expect(result[0]).toBeCloseTo(1.2, 2);
    expect(result[1]).toBeCloseTo(0.8, 2);
  });

  it('wraps weights for longer gain arrays', () => {
    const gains = new Array(16).fill(0.1);
    const profile = moodAccentProfile('disco');
    const result = applyAccentProfile(gains, profile);
    // Step 0 and step 8 should have same weight
    expect(result[0]).toBeCloseTo(result[8], 6);
  });

  it('handles empty array', () => {
    const result = applyAccentProfile([], moodAccentProfile('trance'));
    expect(result).toEqual([]);
  });
});

describe('accentGainPattern', () => {
  it('returns space-separated string', () => {
    const pattern = accentGainPattern('disco', 8, 0.1);
    const parts = pattern.split(' ');
    expect(parts.length).toBe(8);
    for (const p of parts) {
      expect(parseFloat(p)).toBeGreaterThan(0);
    }
  });

  it('trance downbeat is loudest', () => {
    const pattern = accentGainPattern('trance', 8, 0.1);
    const values = pattern.split(' ').map(parseFloat);
    const maxIdx = values.indexOf(Math.max(...values));
    expect(maxIdx).toBe(0);
  });
});
