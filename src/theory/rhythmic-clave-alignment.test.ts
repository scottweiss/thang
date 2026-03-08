import { describe, it, expect } from 'vitest';
import {
  claveAlignmentGain,
  claveStrengthValue,
} from './rhythmic-clave-alignment';

describe('claveAlignmentGain', () => {
  it('clave position gets accent', () => {
    // Position 0 is always in all clave patterns
    const gain = claveAlignmentGain(0, 0, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-clave position is neutral', () => {
    // Position 1 is never in son clave 3-2
    const gain = claveAlignmentGain(1, 0, 'disco', 'groove');
    expect(gain).toBe(1.0);
  });

  it('clave pattern rotates with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 24; t++) {
      // Position 4 is in 2-3 but not 3-2
      values.add(claveAlignmentGain(4, t, 'disco', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('disco aligns more than ambient', () => {
    let discoSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      discoSum += claveAlignmentGain(p, 0, 'disco', 'groove');
      ambSum += claveAlignmentGain(p, 0, 'ambient', 'groove');
    }
    expect(discoSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 25; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = claveAlignmentGain(p, t, 'disco', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('claveStrengthValue', () => {
  it('disco is highest', () => {
    expect(claveStrengthValue('disco')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(claveStrengthValue('ambient')).toBe(0.05);
  });
});
