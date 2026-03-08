import { describe, it, expect } from 'vitest';
import {
  anacrusisEmphasisGain,
  anacrusisStrengthValue,
} from './rhythmic-anacrusis-emphasis';

describe('anacrusisEmphasisGain', () => {
  it('position 15 gets strong emphasis', () => {
    const gain = anacrusisEmphasisGain(15, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('position 7 gets strong emphasis', () => {
    const gain = anacrusisEmphasisGain(7, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('position 14 gets lighter emphasis', () => {
    const strong = anacrusisEmphasisGain(15, 'disco', 'groove');
    const light = anacrusisEmphasisGain(14, 'disco', 'groove');
    expect(light).toBeGreaterThan(1.0);
    expect(strong).toBeGreaterThan(light);
  });

  it('non-anacrusis is neutral', () => {
    const gain = anacrusisEmphasisGain(4, 'disco', 'groove');
    expect(gain).toBe(1.0);
  });

  it('disco emphasizes more than ambient', () => {
    const di = anacrusisEmphasisGain(15, 'disco', 'groove');
    const amb = anacrusisEmphasisGain(15, 'ambient', 'groove');
    expect(di).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = anacrusisEmphasisGain(p, 'disco', 'groove');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('anacrusisStrengthValue', () => {
  it('disco is highest', () => {
    expect(anacrusisStrengthValue('disco')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(anacrusisStrengthValue('ambient')).toBe(0.10);
  });
});
