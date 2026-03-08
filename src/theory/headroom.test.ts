import { describe, it, expect } from 'vitest';
import { headroomScalar, shouldApplyHeadroom } from './headroom';

describe('headroomScalar', () => {
  it('returns 1.0 for 1 layer', () => {
    expect(headroomScalar(1)).toBe(1.0);
  });

  it('returns 1.0 for 2 layers', () => {
    expect(headroomScalar(2)).toBe(1.0);
  });

  it('reduces for 3 layers', () => {
    expect(headroomScalar(3)).toBeLessThan(1.0);
    expect(headroomScalar(3)).toBeGreaterThan(0.85);
  });

  it('reduces more for 6 layers', () => {
    expect(headroomScalar(6)).toBeLessThan(headroomScalar(3));
  });

  it('monotonically decreases', () => {
    for (let i = 1; i <= 6; i++) {
      expect(headroomScalar(i)).toBeGreaterThanOrEqual(headroomScalar(i + 1));
    }
  });

  it('never goes below 0.5', () => {
    expect(headroomScalar(10)).toBeGreaterThan(0.5);
  });

  it('is smooth — no sudden jumps between adjacent counts', () => {
    for (let i = 1; i <= 7; i++) {
      const diff = Math.abs(headroomScalar(i) - headroomScalar(i + 1));
      expect(diff).toBeLessThan(0.1); // no jump > 10%
    }
  });
});

describe('shouldApplyHeadroom', () => {
  it('returns false for 1-2 layers', () => {
    expect(shouldApplyHeadroom(1)).toBe(false);
    expect(shouldApplyHeadroom(2)).toBe(false);
  });

  it('returns true for 3+ layers', () => {
    expect(shouldApplyHeadroom(3)).toBe(true);
    expect(shouldApplyHeadroom(6)).toBe(true);
  });
});
