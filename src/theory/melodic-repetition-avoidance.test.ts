import { describe, it, expect } from 'vitest';
import {
  repetitionAvoidanceGain,
  penaltyStrength,
} from './melodic-repetition-avoidance';

describe('repetitionAvoidanceGain', () => {
  it('different pitches return 1.0', () => {
    expect(repetitionAvoidanceGain(0, 7, 'avril')).toBe(1.0);
  });

  it('same pitch gets penalty', () => {
    const gain = repetitionAvoidanceGain(5, 5, 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('syro penalizes more than ambient', () => {
    const syro = repetitionAvoidanceGain(3, 3, 'syro');
    const amb = repetitionAvoidanceGain(3, 3, 'ambient');
    expect(syro).toBeLessThan(amb);
  });

  it('ambient barely penalizes', () => {
    const gain = repetitionAvoidanceGain(0, 0, 'ambient');
    expect(gain).toBeGreaterThan(0.96);
  });

  it('stays in 0.88-1.0 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const gain = repetitionAvoidanceGain(pc, pc, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('penaltyStrength', () => {
  it('syro is highest', () => {
    expect(penaltyStrength('syro')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(penaltyStrength('ambient')).toBe(0.15);
  });
});
