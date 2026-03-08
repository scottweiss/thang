import { describe, it, expect } from 'vitest';
import {
  leapRecoveryWeight,
  wasLeap,
  recoveryStrength,
} from './intervallic-leap-recovery';

describe('leapRecoveryWeight', () => {
  it('1.0 when previous was not a leap', () => {
    expect(leapRecoveryWeight(2, -1, 'avril')).toBe(1.0);
  });

  it('high weight for stepwise contrary after leap', () => {
    // Leaped up 7, now stepping down 1
    const w = leapRecoveryWeight(7, -1, 'avril');
    expect(w).toBeGreaterThan(1.3);
  });

  it('moderate weight for small contrary after leap', () => {
    // Leaped up 7, moving down 3
    const w = leapRecoveryWeight(7, -3, 'avril');
    expect(w).toBeGreaterThan(1.0);
    expect(w).toBeLessThan(leapRecoveryWeight(7, -1, 'avril'));
  });

  it('low weight for continuing leap in same direction', () => {
    // Leaped up 7, another leap up 5
    const w = leapRecoveryWeight(7, 5, 'avril');
    expect(w).toBeLessThan(1.0);
  });

  it('syro is more permissive of continued leaps', () => {
    const avril = leapRecoveryWeight(7, 5, 'avril');
    const syro = leapRecoveryWeight(7, 5, 'syro');
    expect(syro).toBeGreaterThan(avril);
  });

  it('stays in 0.5-2.0 range', () => {
    for (const prev of [-12, -7, -5, 5, 7, 12]) {
      for (const cand of [-5, -2, -1, 0, 1, 2, 5]) {
        const w = leapRecoveryWeight(prev, cand, 'avril');
        expect(w).toBeGreaterThanOrEqual(0.5);
        expect(w).toBeLessThanOrEqual(2.0);
      }
    }
  });
});

describe('wasLeap', () => {
  it('true for 5 semitones', () => {
    expect(wasLeap(5)).toBe(true);
  });

  it('false for 3 semitones', () => {
    expect(wasLeap(3)).toBe(false);
  });

  it('true for negative leap', () => {
    expect(wasLeap(-7)).toBe(true);
  });
});

describe('recoveryStrength', () => {
  it('avril is highest', () => {
    expect(recoveryStrength('avril')).toBe(0.70);
  });

  it('syro is lowest', () => {
    expect(recoveryStrength('syro')).toBe(0.15);
  });
});
