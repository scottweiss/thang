import { describe, it, expect } from 'vitest';
import {
  beatingFrequency,
  beatingCharacter,
  beatingFmCorrection,
  beatingTolerance,
} from './overtone-beating';

describe('beatingFrequency', () => {
  it('identical frequencies have no beating', () => {
    expect(beatingFrequency(440, 440)).toBe(0);
  });

  it('slightly detuned gives slow beating', () => {
    expect(beatingFrequency(440, 442)).toBe(2);
  });

  it('is always positive', () => {
    expect(beatingFrequency(440, 450)).toBe(10);
    expect(beatingFrequency(450, 440)).toBe(10);
  });
});

describe('beatingCharacter', () => {
  it('no beating is smooth', () => {
    expect(beatingCharacter(0)).toBe('smooth');
  });

  it('slow beating is warm', () => {
    expect(beatingCharacter(3)).toBe('warm');
  });

  it('medium beating is vibrato', () => {
    expect(beatingCharacter(8)).toBe('vibrato');
  });

  it('fast beating is rough', () => {
    expect(beatingCharacter(20)).toBe('rough');
  });

  it('very fast is smooth again', () => {
    expect(beatingCharacter(50)).toBe('smooth');
  });
});

describe('beatingFmCorrection', () => {
  it('warm beating boosts FM for tolerant moods', () => {
    const correction = beatingFmCorrection(3, 'lofi');
    expect(correction).toBeGreaterThan(1.0);
  });

  it('rough beating reduces FM for clean moods', () => {
    const correction = beatingFmCorrection(20, 'xtal');
    expect(correction).toBeLessThan(1.0);
  });

  it('smooth has no effect', () => {
    expect(beatingFmCorrection(0, 'lofi')).toBe(1.0);
  });

  it('stays in 0.7-1.15 range', () => {
    for (const freq of [0, 3, 8, 20, 50]) {
      const c = beatingFmCorrection(freq, 'ambient');
      expect(c).toBeGreaterThanOrEqual(0.7);
      expect(c).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('beatingTolerance', () => {
  it('ambient is highest', () => {
    expect(beatingTolerance('ambient')).toBe(0.60);
  });

  it('xtal is low', () => {
    expect(beatingTolerance('xtal')).toBe(0.20);
  });
});
