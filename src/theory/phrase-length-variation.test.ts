import { describe, it, expect } from 'vitest';
import {
  phraseLengthGain,
  variationAppetite,
} from './phrase-length-variation';

describe('phraseLengthGain', () => {
  it('varied length in syro gets boost', () => {
    const gain = phraseLengthGain(6, 8, 'syro');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('same as average is near neutral', () => {
    const gain = phraseLengthGain(8, 8, 'syro');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('syro has more appetite than disco', () => {
    expect(variationAppetite('syro')).toBeGreaterThan(variationAppetite('disco'));
  });

  it('stays in 0.96-1.06 range', () => {
    for (let l = 2; l <= 16; l += 2) {
      const gain = phraseLengthGain(l, 8, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('variationAppetite', () => {
  it('syro is highest', () => {
    expect(variationAppetite('syro')).toBe(0.65);
  });

  it('disco is lowest', () => {
    expect(variationAppetite('disco')).toBe(0.15);
  });
});
