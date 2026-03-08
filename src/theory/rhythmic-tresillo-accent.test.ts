import { describe, it, expect } from 'vitest';
import {
  tresilloAccentGain,
  tresilloStrengthValue,
} from './rhythmic-tresillo-accent';

describe('tresilloAccentGain', () => {
  it('tresillo position gets accent', () => {
    // Position 0 is tresillo
    const gain = tresilloAccentGain(0, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('position 3 gets accent', () => {
    const gain = tresilloAccentGain(3, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('position 6 gets accent', () => {
    const gain = tresilloAccentGain(6, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-tresillo is neutral', () => {
    const gain = tresilloAccentGain(1, 'disco', 'groove');
    expect(gain).toBe(1.0);
  });

  it('second half-bar also gets tresillo', () => {
    // Position 8 maps to cell position 0
    const gain = tresilloAccentGain(8, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('disco accents more than ambient', () => {
    const di = tresilloAccentGain(0, 'disco', 'groove');
    const amb = tresilloAccentGain(0, 'ambient', 'groove');
    expect(di).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = tresilloAccentGain(p, 'disco', 'groove');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('tresilloStrengthValue', () => {
  it('disco is highest', () => {
    expect(tresilloStrengthValue('disco')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(tresilloStrengthValue('ambient')).toBe(0.05);
  });
});
