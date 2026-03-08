import { describe, it, expect } from 'vitest';
import {
  phraseSymmetryGain,
  symmetryPreference,
} from './phrase-symmetry-scoring';

describe('phraseSymmetryGain', () => {
  it('equal phrases get boost in trance', () => {
    const gain = phraseSymmetryGain(8, 8, 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('very asymmetric phrases get reduction', () => {
    const gain = phraseSymmetryGain(8, 2, 'trance');
    expect(gain).toBeLessThan(1.0);
  });

  it('syro barely cares about symmetry', () => {
    const trance = phraseSymmetryGain(8, 8, 'trance');
    const syro = phraseSymmetryGain(8, 8, 'syro');
    expect(trance).toBeGreaterThan(syro);
  });

  it('stays in 0.96-1.06 range', () => {
    for (let l = 2; l <= 16; l += 2) {
      const gain = phraseSymmetryGain(l, 8, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('symmetryPreference', () => {
  it('trance is highest', () => {
    expect(symmetryPreference('trance')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(symmetryPreference('syro')).toBe(0.15);
  });
});
