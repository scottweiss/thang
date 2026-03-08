import { describe, it, expect } from 'vitest';
import {
  expectationFulfillmentGain,
  fulfillmentEmphasis,
} from './harmonic-expectation-fulfillment';

describe('expectationFulfillmentGain', () => {
  it('V to I gets boost (G=7 to C=0, interval=5)', () => {
    const gain = expectationFulfillmentGain(7, 0, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('unexpected progression is neutral', () => {
    // C to F# (tritone, interval=6) — unexpected
    const gain = expectationFulfillmentGain(0, 6, 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril rewards more than syro', () => {
    const avril = expectationFulfillmentGain(7, 0, 'avril');
    const syro = expectationFulfillmentGain(7, 0, 'syro');
    expect(avril).toBeGreaterThan(syro);
  });

  it('stays in 0.97-1.08 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const gain = expectationFulfillmentGain(0, pc, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('fulfillmentEmphasis', () => {
  it('avril is highest', () => {
    expect(fulfillmentEmphasis('avril')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(fulfillmentEmphasis('syro')).toBe(0.15);
  });
});
