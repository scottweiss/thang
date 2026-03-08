import { describe, it, expect } from 'vitest';
import {
  pivotPreparationFm,
  pivotDepthValue,
} from './harmonic-pivot-preparation';

describe('pivotPreparationFm', () => {
  it('no common tones is neutral', () => {
    const fm = pivotPreparationFm(0, 'avril', 'build');
    expect(fm).toBe(1.0);
  });

  it('common tones enrich FM', () => {
    const fm = pivotPreparationFm(3, 'avril', 'breakdown');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('more common tones = more enrichment', () => {
    const two = pivotPreparationFm(2, 'avril', 'build');
    const four = pivotPreparationFm(4, 'avril', 'build');
    expect(four).toBeGreaterThan(two);
  });

  it('avril enriches more than syro', () => {
    const av = pivotPreparationFm(3, 'avril', 'build');
    const sy = pivotPreparationFm(3, 'syro', 'build');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.04 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (let c = 0; c <= 5; c++) {
        const fm = pivotPreparationFm(c, 'avril', s);
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('pivotDepthValue', () => {
  it('avril is highest', () => {
    expect(pivotDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(pivotDepthValue('blockhead')).toBe(0.15);
  });
});
