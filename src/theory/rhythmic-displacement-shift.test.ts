import { describe, it, expect } from 'vitest';
import {
  displacementShiftOffset,
  displacementEmphasisGain,
  displacementAmountValue,
} from './rhythmic-displacement-shift';

describe('displacementShiftOffset', () => {
  it('produces variation across beat positions', () => {
    const values = new Set<string>();
    for (let b = 0; b < 16; b++) {
      values.add(displacementShiftOffset(b, 5, 'syro', 'groove').toFixed(5));
    }
    expect(values.size).toBeGreaterThan(3);
  });

  it('evolves over time', () => {
    const values = new Set<string>();
    for (let t = 0; t < 20; t++) {
      values.add(displacementShiftOffset(0, t, 'blockhead', 'peak').toFixed(5));
    }
    expect(values.size).toBeGreaterThan(3);
  });

  it('stays in [-0.015, 0.015] range', () => {
    for (let t = 0; t < 50; t++) {
      for (let b = 0; b < 16; b++) {
        const offset = displacementShiftOffset(b, t, 'syro', 'groove');
        expect(offset).toBeGreaterThanOrEqual(-0.015);
        expect(offset).toBeLessThanOrEqual(0.015);
      }
    }
  });

  it('syro displaces more than ambient', () => {
    let syroRange = 0;
    let ambientRange = 0;
    for (let b = 0; b < 16; b++) {
      syroRange += Math.abs(displacementShiftOffset(b, 10, 'syro', 'peak'));
      ambientRange += Math.abs(displacementShiftOffset(b, 10, 'ambient', 'peak'));
    }
    expect(syroRange).toBeGreaterThan(ambientRange);
  });
});

describe('displacementEmphasisGain', () => {
  it('zero offset is neutral', () => {
    expect(displacementEmphasisGain(0, 'syro')).toBe(1.0);
  });

  it('displaced beats get boost', () => {
    const gain = displacementEmphasisGain(0.01, 'syro');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('stays in 1.0-1.02 range', () => {
    for (let o = -0.015; o <= 0.015; o += 0.001) {
      const gain = displacementEmphasisGain(o, 'syro');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.02);
    }
  });
});

describe('displacementAmountValue', () => {
  it('syro is highest', () => {
    expect(displacementAmountValue('syro')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(displacementAmountValue('ambient')).toBe(0.10);
  });
});
