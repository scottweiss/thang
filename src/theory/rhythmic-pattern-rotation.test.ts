import { describe, it, expect } from 'vitest';
import {
  patternRotationGain,
  rotationSpeed,
} from './rhythmic-pattern-rotation';

describe('patternRotationGain', () => {
  it('produces variation over time', () => {
    const values = new Set<string>();
    for (let t = 0; t < 20; t++) {
      values.add(patternRotationGain(t, 0, 'syro').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(3);
  });

  it('different beats get different emphasis', () => {
    const a = patternRotationGain(5, 0, 'syro');
    const b = patternRotationGain(5, 7, 'syro');
    expect(a).not.toBeCloseTo(b, 3);
  });

  it('stays in 0.97-1.03 range', () => {
    for (let t = 0; t < 50; t++) {
      for (let b = 0; b < 16; b++) {
        const gain = patternRotationGain(t, b, 'syro');
        expect(gain).toBeGreaterThanOrEqual(0.97);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('rotationSpeed', () => {
  it('syro is fastest', () => {
    expect(rotationSpeed('syro')).toBe(0.55);
  });

  it('trance is slowest', () => {
    expect(rotationSpeed('trance')).toBe(0.10);
  });
});
