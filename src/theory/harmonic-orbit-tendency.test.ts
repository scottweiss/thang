import { describe, it, expect } from 'vitest';
import {
  tendencyStrength,
  orbitTendencyFm,
  orbitStrengthValue,
} from './harmonic-orbit-tendency';

describe('tendencyStrength', () => {
  it('leading tone to tonic is strongest', () => {
    expect(tendencyStrength(6, 0)).toBe(1.0);
  });

  it('fa to mi is strong', () => {
    expect(tendencyStrength(3, 2)).toBe(0.8);
  });

  it('random motion has no tendency', () => {
    expect(tendencyStrength(2, 5)).toBe(0);
  });

  it('negative degrees normalize correctly', () => {
    expect(tendencyStrength(-1, 0)).toBe(1.0); // -1 % 7 = 6 → 0
  });
});

describe('orbitTendencyFm', () => {
  it('tendency motion gets FM boost', () => {
    const fm = orbitTendencyFm(6, 0, 'avril', 'peak');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('non-tendency is neutral', () => {
    const fm = orbitTendencyFm(2, 5, 'avril', 'peak');
    expect(fm).toBe(1.0);
  });

  it('stronger tendency = more boost', () => {
    const leading = orbitTendencyFm(6, 0, 'avril', 'peak'); // strength 1.0
    const subdTodom = orbitTendencyFm(3, 4, 'avril', 'peak'); // strength 0.4
    expect(leading).toBeGreaterThan(subdTodom);
  });

  it('avril boosts more than blockhead', () => {
    const av = orbitTendencyFm(6, 0, 'avril', 'peak');
    const bh = orbitTendencyFm(6, 0, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let f = 0; f < 7; f++) {
      for (let t = 0; t < 7; t++) {
        const fm = orbitTendencyFm(f, t, 'avril', 'peak');
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('orbitStrengthValue', () => {
  it('avril is highest', () => {
    expect(orbitStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(orbitStrengthValue('blockhead')).toBe(0.15);
  });
});
