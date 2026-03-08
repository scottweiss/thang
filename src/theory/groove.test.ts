import { describe, it, expect } from 'vitest';
import {
  applySwing,
  humanize,
  grooveTemplate,
  velocityCurve,
} from './groove';

describe('applySwing', () => {
  it('does not affect on-beat (even grid index) positions', () => {
    // Positions at grid indices 0, 2, 4 (gridSize=0.25)
    const positions = [0, 0.5, 1.0];
    const result = applySwing(positions, 0.5, 0.25);
    expect(result[0]).toBe(0);     // grid index 0
    expect(result[1]).toBe(0.5);   // grid index 2
    expect(result[2]).toBe(1.0);   // grid index 4
  });

  it('delays off-beat (odd grid index) positions', () => {
    // Position at grid index 1 (0.25) and grid index 3 (0.75)
    const positions = [0.25, 0.75];
    const gridSize = 0.25;
    const amount = 0.5;
    const result = applySwing(positions, amount, gridSize);
    const expectedDelay = amount * (gridSize / 2); // 0.0625
    expect(result[0]).toBeCloseTo(0.25 + expectedDelay);
    expect(result[1]).toBeCloseTo(0.75 + expectedDelay);
  });

  it('amount=0 returns positions unchanged', () => {
    const positions = [0, 0.25, 0.5, 0.75];
    const result = applySwing(positions, 0, 0.25);
    expect(result).toEqual(positions);
  });

  it('amount=1 applies maximum swing', () => {
    const positions = [0.25]; // grid index 1 (off-beat)
    const gridSize = 0.25;
    const result = applySwing(positions, 1, gridSize);
    expect(result[0]).toBeCloseTo(0.25 + gridSize / 2);
  });

  it('returns empty array for empty input', () => {
    expect(applySwing([], 0.5, 0.25)).toEqual([]);
  });

  it('clamps amount to 0-1 range', () => {
    const positions = [0.25]; // off-beat
    const gridSize = 0.25;
    const overResult = applySwing(positions, 2.0, gridSize);
    const maxResult = applySwing(positions, 1.0, gridSize);
    expect(overResult[0]).toBeCloseTo(maxResult[0]);

    const underResult = applySwing(positions, -1.0, gridSize);
    const minResult = applySwing(positions, 0.0, gridSize);
    expect(underResult[0]).toBeCloseTo(minResult[0]);
  });

  it('mixed on-beat and off-beat positions', () => {
    // 16th note grid: 0, 0.25, 0.5, 0.75
    const positions = [0, 0.25, 0.5, 0.75];
    const gridSize = 0.25;
    const amount = 0.6;
    const result = applySwing(positions, amount, gridSize);
    const delay = amount * (gridSize / 2);

    expect(result[0]).toBe(0);                      // on-beat
    expect(result[1]).toBeCloseTo(0.25 + delay);     // off-beat
    expect(result[2]).toBe(0.5);                     // on-beat
    expect(result[3]).toBeCloseTo(0.75 + delay);     // off-beat
  });
});

describe('humanize', () => {
  it('returns same length array', () => {
    const positions = [0, 0.25, 0.5, 0.75];
    const result = humanize(positions, 0.5);
    expect(result).toHaveLength(4);
  });

  it('amount=0 returns positions unchanged', () => {
    const positions = [0, 0.25, 0.5, 0.75];
    const result = humanize(positions, 0);
    result.forEach((val, i) => {
      expect(val).toBe(positions[i]);
    });
  });

  it('offsets stay within bounds', () => {
    const positions = Array.from({ length: 100 }, (_, i) => i * 0.1);
    const amount = 1.0;
    const maxOffset = amount * 0.03;
    const result = humanize(positions, amount);

    result.forEach((val, i) => {
      const diff = Math.abs(val - positions[i]);
      expect(diff).toBeLessThanOrEqual(maxOffset + 1e-10);
    });
  });

  it('produces deterministic results (seeded PRNG)', () => {
    const positions = [0, 0.25, 0.5, 0.75];
    const result1 = humanize(positions, 0.5);
    const result2 = humanize(positions, 0.5);
    expect(result1).toEqual(result2);
  });

  it('returns empty array for empty input', () => {
    expect(humanize([], 0.5)).toEqual([]);
  });

  it('applies non-zero offsets when amount > 0', () => {
    const positions = [0, 0.5, 1.0];
    const result = humanize(positions, 1.0);
    // At least some positions should differ
    const anyDifferent = result.some((val, i) => val !== positions[i]);
    expect(anyDifferent).toBe(true);
  });
});

describe('grooveTemplate', () => {
  it('straight returns all zeros', () => {
    const result = grooveTemplate('straight', 8);
    expect(result).toHaveLength(8);
    expect(result.every((v) => v === 0)).toBe(true);
  });

  it('shuffle delays off-beats by 33%', () => {
    const result = grooveTemplate('shuffle', 8);
    expect(result).toHaveLength(8);
    result.forEach((val, i) => {
      if (i % 2 === 0) {
        expect(val).toBe(0);
      } else {
        expect(val).toBeCloseTo(0.33);
      }
    });
  });

  it('triplet cycles through 0, 1/3, 2/3', () => {
    const result = grooveTemplate('triplet', 6);
    expect(result).toHaveLength(6);
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(1 / 3);
    expect(result[2]).toBeCloseTo(2 / 3);
    expect(result[3]).toBeCloseTo(0);
    expect(result[4]).toBeCloseTo(1 / 3);
    expect(result[5]).toBeCloseTo(2 / 3);
  });

  it('push produces negative offsets', () => {
    const result = grooveTemplate('push', 4);
    expect(result).toHaveLength(4);
    result.forEach((val) => {
      expect(val).toBeLessThan(0);
      expect(val).toBeGreaterThanOrEqual(-0.02);
      expect(val).toBeLessThanOrEqual(-0.01);
    });
  });

  it('lazy produces positive offsets', () => {
    const result = grooveTemplate('lazy', 4);
    expect(result).toHaveLength(4);
    result.forEach((val) => {
      expect(val).toBeGreaterThan(0);
      expect(val).toBeGreaterThanOrEqual(0.01);
      expect(val).toBeLessThanOrEqual(0.02);
    });
  });

  it('returns correct length for any step count', () => {
    expect(grooveTemplate('straight', 1)).toHaveLength(1);
    expect(grooveTemplate('shuffle', 16)).toHaveLength(16);
    expect(grooveTemplate('triplet', 32)).toHaveLength(32);
  });

  it('returns empty array for 0 steps', () => {
    expect(grooveTemplate('straight', 0)).toEqual([]);
    expect(grooveTemplate('shuffle', 0)).toEqual([]);
    expect(grooveTemplate('triplet', 0)).toEqual([]);
    expect(grooveTemplate('push', 0)).toEqual([]);
    expect(grooveTemplate('lazy', 0)).toEqual([]);
  });
});

describe('velocityCurve', () => {
  it('flat returns all 1.0', () => {
    const result = velocityCurve(8, 'flat');
    expect(result).toHaveLength(8);
    expect(result.every((v) => v === 1.0)).toBe(true);
  });

  it('accent14 accents beats 1 and 3 in groups of 4', () => {
    const result = velocityCurve(8, 'accent14');
    expect(result).toHaveLength(8);
    // Beats 0,2,4,6 are accented (1.0), beats 1,3,5,7 are soft (0.7)
    expect(result[0]).toBe(1.0);
    expect(result[1]).toBe(0.7);
    expect(result[2]).toBe(1.0);
    expect(result[3]).toBe(0.7);
    expect(result[4]).toBe(1.0);
    expect(result[5]).toBe(0.7);
    expect(result[6]).toBe(1.0);
    expect(result[7]).toBe(0.7);
  });

  it('accent1 only accents beat 1 in groups of 4', () => {
    const result = velocityCurve(8, 'accent1');
    expect(result).toHaveLength(8);
    expect(result[0]).toBe(1.0);
    expect(result[1]).toBe(0.7);
    expect(result[2]).toBe(0.7);
    expect(result[3]).toBe(0.7);
    expect(result[4]).toBe(1.0);
    expect(result[5]).toBe(0.7);
    expect(result[6]).toBe(0.7);
    expect(result[7]).toBe(0.7);
  });

  it('crescendo ramps from 0.5 to 1.0', () => {
    const result = velocityCurve(5, 'crescendo');
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(0.5);
    expect(result[4]).toBeCloseTo(1.0);
    // Should be monotonically increasing
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
    }
  });

  it('decrescendo ramps from 1.0 to 0.5', () => {
    const result = velocityCurve(5, 'decrescendo');
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(1.0);
    expect(result[4]).toBeCloseTo(0.5);
    // Should be monotonically decreasing
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i - 1]);
    }
  });

  it('crescendo and decrescendo are symmetric', () => {
    const cresc = velocityCurve(8, 'crescendo');
    const decresc = velocityCurve(8, 'decrescendo');
    for (let i = 0; i < 8; i++) {
      expect(cresc[i] + decresc[i]).toBeCloseTo(1.5);
    }
  });

  it('all values are between 0 and 1', () => {
    const patterns = ['flat', 'accent14', 'accent1', 'crescendo', 'decrescendo'] as const;
    for (const p of patterns) {
      const result = velocityCurve(16, p);
      result.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1.0);
      });
    }
  });

  it('returns empty array for 0 steps', () => {
    expect(velocityCurve(0, 'flat')).toEqual([]);
    expect(velocityCurve(0, 'accent14')).toEqual([]);
    expect(velocityCurve(0, 'crescendo')).toEqual([]);
  });

  it('handles single step', () => {
    expect(velocityCurve(1, 'flat')).toEqual([1.0]);
    expect(velocityCurve(1, 'crescendo')).toEqual([1.0]);
    expect(velocityCurve(1, 'decrescendo')).toEqual([1.0]);
  });

  it('average velocity for flat pattern is 1.0', () => {
    const result = velocityCurve(16, 'flat');
    const avg = result.reduce((a, b) => a + b, 0) / result.length;
    expect(avg).toBeCloseTo(1.0);
  });

  it('average velocity for crescendo is 0.75', () => {
    const result = velocityCurve(101, 'crescendo');
    const avg = result.reduce((a, b) => a + b, 0) / result.length;
    expect(avg).toBeCloseTo(0.75, 1);
  });
});
