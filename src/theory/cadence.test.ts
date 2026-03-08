import { describe, it, expect } from 'vitest';
import { getCadentialTarget, cadenceUrgency } from './cadence';

describe('cadenceUrgency', () => {
  it('returns 0 before 75% of section', () => {
    expect(cadenceUrgency(0)).toBe(0);
    expect(cadenceUrgency(0.5)).toBe(0);
    expect(cadenceUrgency(0.74)).toBe(0);
  });

  it('ramps from 0 to 1 over last 25%', () => {
    expect(cadenceUrgency(0.75)).toBeCloseTo(0, 1);
    expect(cadenceUrgency(0.875)).toBeCloseTo(0.5, 1);
    expect(cadenceUrgency(1.0)).toBeCloseTo(1.0, 1);
  });
});

describe('getCadentialTarget', () => {
  it('returns null at low urgency', () => {
    // Run many times — should always be null below threshold
    for (let i = 0; i < 50; i++) {
      expect(getCadentialTarget(3, 0.1)).toBeNull();
    }
  });

  it('returns tonic (0) at very high urgency', () => {
    // At urgency 0.95, should almost always resolve to 0
    const results = Array.from({ length: 100 }, () => getCadentialTarget(4, 0.95));
    const tonicCount = results.filter(r => r === 0).length;
    expect(tonicCount).toBeGreaterThan(70);
  });

  it('favors dominant (4) at medium-high urgency', () => {
    // At urgency 0.75, from degree 2, should often target V (4)
    const results = Array.from({ length: 100 }, () => getCadentialTarget(2, 0.75));
    const nonNull = results.filter(r => r !== null);
    const dominantCount = nonNull.filter(r => r === 4).length;
    // Should favor dominant when not null
    expect(dominantCount).toBeGreaterThan(nonNull.length * 0.3);
  });

  it('resolves V to I at high urgency', () => {
    // Already on V (4), urgency 0.8 → should resolve to I (0)
    const results = Array.from({ length: 100 }, () => getCadentialTarget(4, 0.8));
    const tonicCount = results.filter(r => r === 0).length;
    expect(tonicCount).toBeGreaterThan(30);
  });

  it('returns valid degree (0-6 or null)', () => {
    for (let i = 0; i < 200; i++) {
      const result = getCadentialTarget(
        Math.floor(Math.random() * 7),
        Math.random()
      );
      if (result !== null) {
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(6);
      }
    }
  });
});
