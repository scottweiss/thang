import { describe, it, expect } from 'vitest';
import { densityEnvelope, modulatedDensity } from './density-envelope';

describe('densityEnvelope', () => {
  it('returns a value near 1.0', () => {
    const mod = densityEnvelope(10, 0, 0.5);
    expect(mod).toBeGreaterThan(0.5);
    expect(mod).toBeLessThan(1.5);
  });

  it('varies over time (not constant)', () => {
    const values = [];
    for (let t = 0; t < 40; t += 0.5) {
      values.push(densityEnvelope(t, 0, 0.5));
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(max - min).toBeGreaterThan(0.01); // should vary
  });

  it('is stable with different tempos', () => {
    const slow = densityEnvelope(10, 0, 0.25);
    const fast = densityEnvelope(10, 0, 0.55);
    expect(slow).toBeGreaterThan(0.5);
    expect(fast).toBeGreaterThan(0.5);
  });
});

describe('modulatedDensity', () => {
  it('stays within valid range', () => {
    for (let t = 0; t < 100; t += 1) {
      const d = modulatedDensity(0.5, t, 0, 0.5);
      expect(d).toBeGreaterThanOrEqual(0.1);
      expect(d).toBeLessThanOrEqual(1.0);
    }
  });

  it('clamps low density', () => {
    const d = modulatedDensity(0.05, 0, 0, 0.5);
    expect(d).toBeGreaterThanOrEqual(0.1);
  });

  it('clamps high density', () => {
    const d = modulatedDensity(0.95, 5, 0, 0.5);
    expect(d).toBeLessThanOrEqual(1.0);
  });
});
