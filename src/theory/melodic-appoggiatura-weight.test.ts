import { describe, it, expect } from 'vitest';
import {
  isAppoggiatura,
  appoggiaturaWeightGain,
  appoggiaturaStrengthValue,
} from './melodic-appoggiatura-weight';

describe('isAppoggiatura', () => {
  it('leap up, step down is appoggiatura', () => {
    expect(isAppoggiatura(5, -1)).toBe(true);
  });

  it('leap down, step up is appoggiatura', () => {
    expect(isAppoggiatura(-7, 2)).toBe(true);
  });

  it('step arriving is not appoggiatura', () => {
    expect(isAppoggiatura(2, -1)).toBe(false);
  });

  it('leap resolving by leap is not appoggiatura', () => {
    expect(isAppoggiatura(5, -5)).toBe(false);
  });

  it('same direction is not appoggiatura', () => {
    expect(isAppoggiatura(5, 1)).toBe(false);
  });
});

describe('appoggiaturaWeightGain', () => {
  it('appoggiatura gets boost', () => {
    const gain = appoggiaturaWeightGain(5, -1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-appoggiatura is neutral', () => {
    const gain = appoggiaturaWeightGain(2, -1, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('larger leap = more emphasis', () => {
    const fifth = appoggiaturaWeightGain(7, -1, 'avril', 'peak');
    const octave = appoggiaturaWeightGain(12, -1, 'avril', 'peak');
    expect(octave).toBeGreaterThan(fifth);
  });

  it('avril emphasizes more than blockhead', () => {
    const av = appoggiaturaWeightGain(7, -1, 'avril', 'peak');
    const bh = appoggiaturaWeightGain(7, -1, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let a = -12; a <= 12; a++) {
      for (let r = -2; r <= 2; r++) {
        const gain = appoggiaturaWeightGain(a, r, 'avril', 'peak');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('appoggiaturaStrengthValue', () => {
  it('avril is highest', () => {
    expect(appoggiaturaStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(appoggiaturaStrengthValue('blockhead')).toBe(0.15);
  });
});
