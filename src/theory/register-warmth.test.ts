import { describe, it, expect } from 'vitest';
import {
  registerLpfMultiplier,
  registerFmMultiplier,
  shouldApplyRegisterWarmth,
  registerSensitivity,
} from './register-warmth';

describe('registerLpfMultiplier', () => {
  it('middle C is neutral', () => {
    expect(registerLpfMultiplier(60, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('high notes are brighter (higher multiplier)', () => {
    const high = registerLpfMultiplier(84, 'lofi');
    const low = registerLpfMultiplier(36, 'lofi');
    expect(high).toBeGreaterThan(low);
  });

  it('trance has less variation', () => {
    const tranceHigh = registerLpfMultiplier(84, 'trance');
    const lofiHigh = registerLpfMultiplier(84, 'lofi');
    expect(Math.abs(tranceHigh - 1.0)).toBeLessThan(Math.abs(lofiHigh - 1.0));
  });
});

describe('registerFmMultiplier', () => {
  it('middle C is neutral', () => {
    expect(registerFmMultiplier(60, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('low notes are richer (higher FM)', () => {
    const low = registerFmMultiplier(36, 'lofi');
    const high = registerFmMultiplier(84, 'lofi');
    expect(low).toBeGreaterThan(high);
  });

  it('inverse relationship to LPF', () => {
    const lpf = registerLpfMultiplier(84, 'lofi');
    const fm = registerFmMultiplier(84, 'lofi');
    // LPF goes up, FM goes down for high notes
    expect(lpf).toBeGreaterThan(1.0);
    expect(fm).toBeLessThan(1.0);
  });
});

describe('shouldApplyRegisterWarmth', () => {
  it('lofi applies', () => {
    expect(shouldApplyRegisterWarmth('lofi')).toBe(true);
  });

  it('syro does not', () => {
    expect(shouldApplyRegisterWarmth('syro')).toBe(false);
  });
});

describe('registerSensitivity', () => {
  it('lofi is highest', () => {
    expect(registerSensitivity('lofi')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(registerSensitivity('syro')).toBe(0.15);
  });
});
