import { describe, it, expect } from 'vitest';
import {
  leapPreparationGain,
  preparationDepth,
} from './melodic-leap-preparation';

describe('leapPreparationGain', () => {
  it('large leap gets preparation boost', () => {
    const gain = leapPreparationGain(7, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('step motion is neutral', () => {
    const gain = leapPreparationGain(2, 'avril');
    expect(gain).toBe(1.0);
  });

  it('larger leap = more preparation', () => {
    const fifth = leapPreparationGain(7, 'avril');
    const octave = leapPreparationGain(12, 'avril');
    expect(octave).toBeGreaterThan(fifth);
  });

  it('avril prepares more than syro', () => {
    const av = leapPreparationGain(7, 'avril');
    const sy = leapPreparationGain(7, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let i = 0; i <= 12; i++) {
      const gain = leapPreparationGain(i, 'avril');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('preparationDepth', () => {
  it('avril is highest', () => {
    expect(preparationDepth('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(preparationDepth('syro')).toBe(0.20);
  });
});
