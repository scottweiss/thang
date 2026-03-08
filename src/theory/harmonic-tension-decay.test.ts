import { describe, it, expect } from 'vitest';
import {
  tensionDecayFm,
  decayRate,
} from './harmonic-tension-decay';

describe('tensionDecayFm', () => {
  it('dim chord at tick 0 has high FM', () => {
    const fm = tensionDecayFm('dim', 0, 'avril');
    expect(fm).toBeGreaterThan(1.1);
  });

  it('dim chord decays over ticks', () => {
    const tick0 = tensionDecayFm('dim', 0, 'avril');
    const tick5 = tensionDecayFm('dim', 5, 'avril');
    expect(tick5).toBeLessThan(tick0);
  });

  it('maj chord has low FM even at tick 0', () => {
    const fm = tensionDecayFm('maj', 0, 'avril');
    expect(fm).toBeLessThan(1.05);
  });

  it('ambient decays faster than syro', () => {
    const amb = tensionDecayFm('dom7', 3, 'ambient');
    const syro = tensionDecayFm('dom7', 3, 'syro');
    expect(amb).toBeLessThan(syro); // ambient releases faster
  });

  it('stays in 0.90-1.15 range', () => {
    for (let t = 0; t <= 10; t++) {
      const fm = tensionDecayFm('dim', t, 'trance');
      expect(fm).toBeGreaterThanOrEqual(0.90);
      expect(fm).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('decayRate', () => {
  it('ambient is highest', () => {
    expect(decayRate('ambient')).toBe(0.70);
  });

  it('syro is low', () => {
    expect(decayRate('syro')).toBe(0.30);
  });
});
