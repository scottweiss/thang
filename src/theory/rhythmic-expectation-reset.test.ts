import { describe, it, expect } from 'vitest';
import {
  reentryGain,
  reentryEmphasis,
} from './rhythmic-expectation-reset';

describe('reentryGain', () => {
  it('immediate re-entry gets strongest boost', () => {
    const gain = reentryGain(0, 'avril');
    expect(gain).toBeGreaterThan(1.05);
  });

  it('1 tick later is less boost', () => {
    const tick0 = reentryGain(0, 'avril');
    const tick1 = reentryGain(1, 'avril');
    expect(tick1).toBeLessThan(tick0);
  });

  it('long after silence returns 1.0', () => {
    expect(reentryGain(5, 'avril')).toBe(1.0);
  });

  it('stays in 1.0-1.12 range', () => {
    for (let t = 0; t <= 5; t++) {
      const gain = reentryGain(t, 'trance');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.12);
    }
  });
});

describe('reentryEmphasis', () => {
  it('avril is highest', () => {
    expect(reentryEmphasis('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(reentryEmphasis('syro')).toBe(0.30);
  });
});
