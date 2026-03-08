import { describe, it, expect } from 'vitest';
import {
  onsetBalanceGain,
  balanceSensitivity,
} from './onset-density-balance';

describe('onsetBalanceGain', () => {
  it('few layers on beat returns 1.0', () => {
    expect(onsetBalanceGain(2, 6, 'ambient')).toBe(1.0);
  });

  it('all layers on beat gets reduction', () => {
    const gain = onsetBalanceGain(6, 6, 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient is more sensitive than trance', () => {
    const amb = onsetBalanceGain(5, 6, 'ambient');
    const trance = onsetBalanceGain(5, 6, 'trance');
    expect(amb).toBeLessThan(trance);
  });

  it('stays in 0.88-1.0 range', () => {
    for (let l = 1; l <= 6; l++) {
      const gain = onsetBalanceGain(l, 6, 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('balanceSensitivity', () => {
  it('ambient is highest', () => {
    expect(balanceSensitivity('ambient')).toBe(0.65);
  });

  it('disco is low', () => {
    expect(balanceSensitivity('disco')).toBe(0.25);
  });
});
