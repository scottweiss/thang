import { describe, it, expect } from 'vitest';
import {
  timbralDecayFm,
  decayRate,
} from './timbral-decay-curve';

describe('timbralDecayFm', () => {
  it('fresh chord (tick 0) is near 1.0', () => {
    const fm = timbralDecayFm(0, 'ambient', 'groove');
    expect(fm).toBeCloseTo(1.0, 2);
  });

  it('sustained chord decays FM', () => {
    const fm = timbralDecayFm(5, 'ambient', 'groove');
    expect(fm).toBeLessThan(1.0);
  });

  it('ambient decays faster than disco', () => {
    const amb = timbralDecayFm(4, 'ambient', 'groove');
    const disco = timbralDecayFm(4, 'disco', 'groove');
    expect(amb).toBeLessThan(disco);
  });

  it('breakdown decays faster than peak', () => {
    const bd = timbralDecayFm(4, 'lofi', 'breakdown');
    const pk = timbralDecayFm(4, 'lofi', 'peak');
    expect(bd).toBeLessThan(pk);
  });

  it('stays in 0.85-1.0 range', () => {
    for (let t = 0; t <= 10; t++) {
      const fm = timbralDecayFm(t, 'ambient', 'breakdown');
      expect(fm).toBeGreaterThanOrEqual(0.85);
      expect(fm).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('decayRate', () => {
  it('xtal is highest', () => {
    expect(decayRate('xtal')).toBe(0.60);
  });

  it('disco is lowest', () => {
    expect(decayRate('disco')).toBe(0.20);
  });
});
