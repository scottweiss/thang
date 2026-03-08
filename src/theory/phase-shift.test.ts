import { describe, it, expect } from 'vitest';
import {
  shouldApplyPhaseShift,
  phaseOffset,
  phaseToLate,
  phaseMaxOffset,
  phaseCycleLength,
  phaseTendency,
} from './phase-shift';

describe('shouldApplyPhaseShift', () => {
  it('is deterministic', () => {
    const a = shouldApplyPhaseShift(42, 'xtal', 'breakdown');
    const b = shouldApplyPhaseShift(42, 'xtal', 'breakdown');
    expect(a).toBe(b);
  });

  it('xtal has more than trance', () => {
    const xtalCount = Array.from({ length: 2000 }, (_, i) =>
      shouldApplyPhaseShift(i, 'xtal', 'breakdown')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 2000 }, (_, i) =>
      shouldApplyPhaseShift(i, 'trance', 'breakdown')
    ).filter(Boolean).length;
    expect(xtalCount).toBeGreaterThan(tranceCount);
  });

  it('breakdown has more than peak', () => {
    const breakdownCount = Array.from({ length: 2000 }, (_, i) =>
      shouldApplyPhaseShift(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 2000 }, (_, i) =>
      shouldApplyPhaseShift(i, 'ambient', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThanOrEqual(peakCount);
  });
});

describe('phaseOffset', () => {
  it('starts at 0', () => {
    expect(phaseOffset(10, 10, 32)).toBe(0);
  });

  it('returns to 0 at cycle end', () => {
    const offset = phaseOffset(42, 10, 32);
    // At tick 42, elapsed = 32 = full cycle, sin(PI) ≈ 0
    expect(offset).toBeCloseTo(0, 5);
  });

  it('peaks at cycle midpoint', () => {
    // At midpoint, sin(0.5 * PI) = 1.0
    const offset = phaseOffset(26, 10, 32); // elapsed = 16, half of 32
    expect(offset).toBeCloseTo(1.0, 5);
  });

  it('handles negative elapsed', () => {
    expect(phaseOffset(5, 10, 32)).toBe(0);
  });

  it('handles zero cycle length', () => {
    expect(phaseOffset(10, 5, 0)).toBe(0);
  });

  it('wraps around for multiple cycles', () => {
    const offset1 = phaseOffset(15, 10, 32);
    const offset2 = phaseOffset(47, 10, 32); // 37 elapsed, 37 % 32 = 5
    expect(offset1).toBeCloseTo(offset2, 5);
  });
});

describe('phaseToLate', () => {
  it('zero offset = zero late', () => {
    expect(phaseToLate(0, 'xtal')).toBe(0);
  });

  it('full offset = max late for mood', () => {
    expect(phaseToLate(1.0, 'syro')).toBe(0.125);
    expect(phaseToLate(1.0, 'trance')).toBe(0.010);
  });

  it('scales linearly', () => {
    const half = phaseToLate(0.5, 'xtal');
    const full = phaseToLate(1.0, 'xtal');
    expect(half).toBeCloseTo(full / 2, 5);
  });
});

describe('phaseMaxOffset', () => {
  it('syro has largest offset', () => {
    expect(phaseMaxOffset('syro')).toBe(0.125);
  });

  it('trance has smallest offset', () => {
    expect(phaseMaxOffset('trance')).toBe(0.010);
  });
});

describe('phaseCycleLength', () => {
  it('ambient has longest cycle', () => {
    expect(phaseCycleLength('ambient')).toBe(48);
  });

  it('trance has shortest cycle', () => {
    expect(phaseCycleLength('trance')).toBe(16);
  });
});

describe('phaseTendency', () => {
  it('xtal has highest', () => {
    expect(phaseTendency('xtal')).toBe(0.40);
  });

  it('trance has lowest', () => {
    expect(phaseTendency('trance')).toBe(0.02);
  });
});
