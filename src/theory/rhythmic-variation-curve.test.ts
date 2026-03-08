import { describe, it, expect } from 'vitest';
import {
  rhythmicVariation,
  variationRange,
} from './rhythmic-variation-curve';

describe('rhythmicVariation', () => {
  it('peak section has highest complexity at center', () => {
    const center = rhythmicVariation(0.5, 'syro', 'peak');
    const edge = rhythmicVariation(0.0, 'syro', 'peak');
    expect(center).toBeGreaterThan(edge);
  });

  it('build section peaks near end', () => {
    const late = rhythmicVariation(0.8, 'flim', 'build');
    const early = rhythmicVariation(0.2, 'flim', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('syro has more variation than disco', () => {
    const syro = rhythmicVariation(0.5, 'syro', 'peak');
    const disco = rhythmicVariation(0.5, 'disco', 'peak');
    expect(Math.abs(syro - 1.0)).toBeGreaterThan(Math.abs(disco - 1.0));
  });

  it('stays in 0.7-1.3 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const v = rhythmicVariation(t, 'syro', 'peak');
      expect(v).toBeGreaterThanOrEqual(0.7);
      expect(v).toBeLessThanOrEqual(1.3);
    }
  });
});

describe('variationRange', () => {
  it('syro is highest', () => {
    expect(variationRange('syro')).toBe(0.60);
  });

  it('disco is lowest', () => {
    expect(variationRange('disco')).toBe(0.25);
  });
});
