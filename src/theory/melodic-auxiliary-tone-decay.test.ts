import { describe, it, expect } from 'vitest';
import {
  auxiliaryToneDecayGain,
  decayRateValue,
} from './melodic-auxiliary-tone-decay';

describe('auxiliaryToneDecayGain', () => {
  it('no repetition is neutral', () => {
    expect(auxiliaryToneDecayGain(0, 'syro', 'peak')).toBe(1.0);
  });

  it('single tick is neutral', () => {
    expect(auxiliaryToneDecayGain(1, 'syro', 'peak')).toBe(1.0);
  });

  it('repetition causes decay', () => {
    const gain = auxiliaryToneDecayGain(4, 'syro', 'peak');
    expect(gain).toBeLessThan(1.0);
  });

  it('more repetition = more decay', () => {
    const short = auxiliaryToneDecayGain(3, 'syro', 'peak');
    const long = auxiliaryToneDecayGain(7, 'syro', 'peak');
    expect(long).toBeLessThan(short);
  });

  it('syro decays faster than ambient', () => {
    const sy = auxiliaryToneDecayGain(5, 'syro', 'peak');
    const amb = auxiliaryToneDecayGain(5, 'ambient', 'peak');
    expect(sy).toBeLessThan(amb);
  });

  it('stays in 0.96-1.0 range', () => {
    for (let r = 0; r <= 10; r++) {
      const gain = auxiliaryToneDecayGain(r, 'syro', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('decayRateValue', () => {
  it('syro is highest', () => {
    expect(decayRateValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(decayRateValue('ambient')).toBe(0.15);
  });
});
