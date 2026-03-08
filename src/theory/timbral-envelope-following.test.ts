import { describe, it, expect } from 'vitest';
import {
  envelopeFmMultiplier,
  envelopeTracking,
} from './timbral-envelope-following';

describe('envelopeFmMultiplier', () => {
  it('attack phase is brightest', () => {
    const attack = envelopeFmMultiplier(0, 'ambient');
    const sustain = envelopeFmMultiplier(0.5, 'ambient');
    expect(attack).toBeGreaterThan(sustain);
  });

  it('decay phase is darkest', () => {
    const sustain = envelopeFmMultiplier(0.5, 'xtal');
    const decay = envelopeFmMultiplier(1.0, 'xtal');
    expect(sustain).toBeGreaterThan(decay);
  });

  it('sustain is near 1.0', () => {
    const sustain = envelopeFmMultiplier(0.4, 'trance');
    expect(sustain).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.7-1.3 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const fm = envelopeFmMultiplier(p, 'ambient');
      expect(fm).toBeGreaterThanOrEqual(0.7);
      expect(fm).toBeLessThanOrEqual(1.3);
    }
  });

  it('low-tracking mood varies less', () => {
    const ambientAttack = envelopeFmMultiplier(0, 'ambient');
    const syroAttack = envelopeFmMultiplier(0, 'syro');
    expect(Math.abs(ambientAttack - 1.0)).toBeGreaterThan(Math.abs(syroAttack - 1.0));
  });
});

describe('envelopeTracking', () => {
  it('ambient is highest', () => {
    expect(envelopeTracking('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(envelopeTracking('syro')).toBe(0.25);
  });
});
