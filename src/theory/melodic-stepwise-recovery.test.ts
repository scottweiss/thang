import { describe, it, expect } from 'vitest';
import {
  stepwiseRecoveryGain,
  recoveryStrengthValue,
} from './melodic-stepwise-recovery';

describe('stepwiseRecoveryGain', () => {
  it('leap up then step down gets boost', () => {
    const gain = stepwiseRecoveryGain(7, -2, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('leap down then step up gets boost', () => {
    const gain = stepwiseRecoveryGain(-7, 1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('step after step is neutral', () => {
    const gain = stepwiseRecoveryGain(2, -1, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('leap followed by leap is neutral', () => {
    const gain = stepwiseRecoveryGain(7, -5, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('same direction is neutral', () => {
    const gain = stepwiseRecoveryGain(7, 2, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('bigger leap = more recovery emphasis', () => {
    const fifth = stepwiseRecoveryGain(7, -1, 'avril', 'peak');
    const octave = stepwiseRecoveryGain(12, -1, 'avril', 'peak');
    expect(octave).toBeGreaterThan(fifth);
  });

  it('avril recovers more than syro', () => {
    const av = stepwiseRecoveryGain(7, -1, 'avril', 'peak');
    const sy = stepwiseRecoveryGain(7, -1, 'syro', 'peak');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let prev = -12; prev <= 12; prev++) {
      for (let cur = -3; cur <= 3; cur++) {
        const gain = stepwiseRecoveryGain(prev, cur, 'avril', 'peak');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('recoveryStrengthValue', () => {
  it('avril is highest', () => {
    expect(recoveryStrengthValue('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(recoveryStrengthValue('syro')).toBe(0.15);
  });
});
