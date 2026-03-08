import { describe, it, expect } from 'vitest';
import { intervalWeight, preferredIntervals } from './intervallic-palette';

describe('intervalWeight', () => {
  it('returns 0.1-1.0 range', () => {
    for (let i = 1; i <= 12; i++) {
      const w = intervalWeight(i, 'lofi');
      expect(w).toBeGreaterThanOrEqual(0.1);
      expect(w).toBeLessThanOrEqual(1.0);
    }
  });

  it('lofi favors minor 3rd (3)', () => {
    expect(intervalWeight(3, 'lofi')).toBe(1.0);
  });

  it('trance favors perfect 5th (7)', () => {
    expect(intervalWeight(7, 'trance')).toBe(1.0);
  });

  it('syro favors tritone (6)', () => {
    expect(intervalWeight(6, 'syro')).toBe(1.0);
  });

  it('handles negative intervals', () => {
    expect(intervalWeight(-3, 'lofi')).toBe(intervalWeight(3, 'lofi'));
  });
});

describe('preferredIntervals', () => {
  it('returns 3 intervals', () => {
    expect(preferredIntervals('lofi')).toHaveLength(3);
  });

  it('trance prefers 5ths and 7ths', () => {
    const prefs = preferredIntervals('trance');
    expect(prefs).toContain(5);
    expect(prefs).toContain(7);
  });

  it('ambient prefers 2nds and 7ths', () => {
    const prefs = preferredIntervals('ambient');
    expect(prefs).toContain(2);
    expect(prefs).toContain(7);
  });
});
