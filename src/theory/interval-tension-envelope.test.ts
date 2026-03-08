import { describe, it, expect } from 'vitest';
import {
  intervalAttackMultiplier,
  attackResponsiveness,
} from './interval-tension-envelope';

describe('intervalAttackMultiplier', () => {
  it('large interval gets shorter attack (< 1)', () => {
    const mult = intervalAttackMultiplier(8, 'avril');
    expect(mult).toBeLessThan(1.0);
  });

  it('small interval gets longer attack (> 1)', () => {
    const mult = intervalAttackMultiplier(1, 'avril');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('medium interval is near neutral', () => {
    const mult = intervalAttackMultiplier(4, 'avril');
    expect(mult).toBeCloseTo(1.0, 2);
  });

  it('avril is more responsive than ambient', () => {
    const av = intervalAttackMultiplier(8, 'avril');
    const amb = intervalAttackMultiplier(8, 'ambient');
    // Both < 1, avril should be further from 1
    expect(Math.abs(av - 1.0)).toBeGreaterThan(Math.abs(amb - 1.0));
  });

  it('stays in 0.85-1.15 range', () => {
    for (let i = 0; i <= 12; i++) {
      const mult = intervalAttackMultiplier(i, 'avril');
      expect(mult).toBeGreaterThanOrEqual(0.85);
      expect(mult).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('attackResponsiveness', () => {
  it('avril is high', () => {
    expect(attackResponsiveness('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(attackResponsiveness('ambient')).toBe(0.20);
  });
});
