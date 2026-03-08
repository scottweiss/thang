import { describe, it, expect } from 'vitest';
import {
  harmonicInertiaGain,
  inertiaStrength,
} from './harmonic-rhythm-inertia';

describe('harmonicInertiaGain', () => {
  it('sustained major chord gets boost', () => {
    const gain = harmonicInertiaGain('maj', 5, 'ambient');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('fresh chord is near neutral', () => {
    const gain = harmonicInertiaGain('maj', 0, 'ambient');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('consonant chord boosts more than dissonant', () => {
    const maj = harmonicInertiaGain('maj', 5, 'ambient');
    const dim = harmonicInertiaGain('dim', 5, 'ambient');
    expect(maj).toBeGreaterThan(dim);
  });

  it('ambient has more inertia than syro', () => {
    const amb = harmonicInertiaGain('maj', 5, 'ambient');
    const syro = harmonicInertiaGain('maj', 5, 'syro');
    expect(amb).toBeGreaterThan(syro);
  });

  it('stays in 1.0-1.04 range', () => {
    const quals = ['maj', 'min', 'dom7', 'dim', 'aug'] as const;
    for (const q of quals) {
      for (let t = 0; t <= 10; t++) {
        const gain = harmonicInertiaGain(q, t, 'ambient');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('inertiaStrength', () => {
  it('ambient is highest', () => {
    expect(inertiaStrength('ambient')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(inertiaStrength('syro')).toBe(0.15);
  });
});
