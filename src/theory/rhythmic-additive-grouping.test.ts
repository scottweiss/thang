import { describe, it, expect } from 'vitest';
import {
  additiveGroupingGain,
  additiveStrengthValue,
} from './rhythmic-additive-grouping';

describe('additiveGroupingGain', () => {
  it('group start gets accent', () => {
    // Position 0 is always a group start
    const gain = additiveGroupingGain(0, 0, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-accent position is neutral', () => {
    // For grouping [3,3,2,3,3,2], accents at 0,3,6,8,11,14
    // Position 1 is not an accent
    const gain = additiveGroupingGain(1, 0, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('pattern evolves with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 18; t++) {
      // Position 6: accent in pattern A (3+3+[2]→pos6) but varies
      values.add(additiveGroupingGain(6, t, 'syro', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('syro accents more than ambient', () => {
    let syroSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      syroSum += additiveGroupingGain(p, 0, 'syro', 'groove');
      ambSum += additiveGroupingGain(p, 0, 'ambient', 'groove');
    }
    expect(syroSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 20; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = additiveGroupingGain(p, t, 'syro', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('additiveStrengthValue', () => {
  it('syro is highest', () => {
    expect(additiveStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(additiveStrengthValue('ambient')).toBe(0.05);
  });
});
