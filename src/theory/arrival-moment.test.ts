import { describe, it, expect } from 'vitest';
import {
  arrivalProbability,
  arrivalGainBoost,
  shouldForceRoot,
} from './arrival-moment';

describe('arrivalProbability', () => {
  it('build→peak has highest probability for trance', () => {
    const prob = arrivalProbability('build', 'peak', 'trance');
    expect(prob).toBeGreaterThan(0.7);
  });

  it('breakdown→groove is moderate', () => {
    const prob = arrivalProbability('breakdown', 'groove', 'trance');
    expect(prob).toBeGreaterThan(0.3);
    expect(prob).toBeLessThan(1.0);
  });

  it('ambient has very low arrival probability', () => {
    const prob = arrivalProbability('build', 'peak', 'ambient');
    expect(prob).toBeLessThan(0.2);
  });

  it('groove→breakdown has no arrival', () => {
    const prob = arrivalProbability('groove', 'breakdown', 'trance');
    expect(prob).toBe(0);
  });

  it('intro→build is occasional', () => {
    const prob = arrivalProbability('intro', 'build', 'disco');
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(0.5);
  });
});

describe('arrivalGainBoost', () => {
  it('texture gets highest boost (drum accent)', () => {
    expect(arrivalGainBoost('texture')).toBeGreaterThan(arrivalGainBoost('melody'));
  });

  it('all boosts are > 1.0', () => {
    for (const layer of ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere']) {
      expect(arrivalGainBoost(layer)).toBeGreaterThan(1.0);
    }
  });

  it('unknown layer gets no boost', () => {
    expect(arrivalGainBoost('unknown')).toBe(1.0);
  });
});

describe('shouldForceRoot', () => {
  it('returns boolean', () => {
    const result = shouldForceRoot();
    expect(typeof result).toBe('boolean');
  });

  it('usually returns true (75% chance)', () => {
    let trueCount = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldForceRoot()) trueCount++;
    }
    // With 200 trials, expect roughly 150 trues (75%)
    expect(trueCount).toBeGreaterThan(100);
    expect(trueCount).toBeLessThan(195);
  });
});
