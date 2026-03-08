import { describe, it, expect } from 'vitest';
import {
  pedalTension,
  pedalTensionFm,
  pedalSensitivity,
} from './pedal-resolution-tension';

describe('pedalTension', () => {
  it('unison is resolved (0)', () => {
    expect(pedalTension(0, 0)).toBe(0);
  });

  it('tritone is maximum tension', () => {
    expect(pedalTension(0, 6)).toBe(0.9);
  });

  it('perfect fifth is low tension', () => {
    expect(pedalTension(0, 7)).toBe(0.1);
  });

  it('minor 2nd is high tension', () => {
    expect(pedalTension(0, 1)).toBe(0.7);
  });

  it('all intervals in 0-1 range', () => {
    for (let i = 0; i < 12; i++) {
      const t = pedalTension(0, i);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });
});

describe('pedalTensionFm', () => {
  it('resolved pedal stays near 1.0', () => {
    const fm = pedalTensionFm(0, 0, 'ambient');
    expect(fm).toBeCloseTo(1.0, 1);
  });

  it('tense pedal boosts FM', () => {
    const fm = pedalTensionFm(0, 6, 'ambient'); // tritone
    expect(fm).toBeGreaterThan(1.0);
  });

  it('stays in 0.85-1.20 range', () => {
    for (let i = 0; i < 12; i++) {
      const fm = pedalTensionFm(0, i, 'ambient');
      expect(fm).toBeGreaterThanOrEqual(0.85);
      expect(fm).toBeLessThanOrEqual(1.20);
    }
  });
});

describe('pedalSensitivity', () => {
  it('ambient is highest', () => {
    expect(pedalSensitivity('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(pedalSensitivity('syro')).toBe(0.25);
  });
});
