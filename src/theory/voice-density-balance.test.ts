import { describe, it, expect } from 'vitest';
import {
  maxHarmonyVoices,
  densityGainPenalty,
  shouldBalanceVoiceDensity,
} from './voice-density-balance';

describe('maxHarmonyVoices', () => {
  it('fewer voices when melody active', () => {
    expect(maxHarmonyVoices('lofi', true)).toBeLessThan(maxHarmonyVoices('lofi', false));
  });

  it('xtal is most restrictive with melody', () => {
    expect(maxHarmonyVoices('xtal', true)).toBe(2);
  });

  it('trance allows 4 with melody', () => {
    expect(maxHarmonyVoices('trance', true)).toBe(4);
  });

  it('lofi allows 5 without melody', () => {
    expect(maxHarmonyVoices('lofi', false)).toBe(5);
  });
});

describe('densityGainPenalty', () => {
  it('1.0 when within limit', () => {
    expect(densityGainPenalty(3, 4, 'lofi')).toBe(1.0);
  });

  it('< 1.0 when exceeding limit', () => {
    expect(densityGainPenalty(5, 3, 'lofi')).toBeLessThan(1.0);
  });

  it('clamped at 0.85', () => {
    expect(densityGainPenalty(10, 2, 'lofi')).toBeGreaterThanOrEqual(0.85);
  });

  it('more excess = more penalty', () => {
    const slight = densityGainPenalty(4, 3, 'lofi');
    const heavy = densityGainPenalty(6, 3, 'lofi');
    expect(heavy).toBeLessThan(slight);
  });
});

describe('shouldBalanceVoiceDensity', () => {
  it('true when voices exceed max', () => {
    expect(shouldBalanceVoiceDensity('xtal', true, 4)).toBe(true);
  });

  it('false when within limit', () => {
    expect(shouldBalanceVoiceDensity('trance', true, 3)).toBe(false);
  });
});
