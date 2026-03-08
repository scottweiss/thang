import { describe, it, expect } from 'vitest';
import {
  impliedTempoLayerGain,
  impliedStrengthValue,
} from './rhythmic-implied-tempo-layer';

describe('impliedTempoLayerGain', () => {
  it('accent position gets boost', () => {
    // tick=0, offset=(0*3)%16=0, accent at 0 and (0+3)%16=3
    const gain = impliedTempoLayerGain(0, 0, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-accent is neutral', () => {
    // tick=0, accents at 0 and 3; position 5 should be neutral
    const gain = impliedTempoLayerGain(5, 0, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('accent pattern drifts with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 16; t++) {
      values.add(impliedTempoLayerGain(4, t, 'syro', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('syro stronger than ambient', () => {
    let syroSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      syroSum += impliedTempoLayerGain(p, 5, 'syro', 'groove');
      ambSum += impliedTempoLayerGain(p, 5, 'ambient', 'groove');
    }
    expect(syroSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 20; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = impliedTempoLayerGain(p, t, 'syro', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('impliedStrengthValue', () => {
  it('syro is highest', () => {
    expect(impliedStrengthValue('syro')).toBe(0.55);
  });

  it('lofi is low', () => {
    expect(impliedStrengthValue('lofi')).toBe(0.15);
  });
});
