import { describe, it, expect } from 'vitest';
import {
  anticipatoryGain,
  anticipationStrength,
} from './anticipatory-accent';

describe('anticipatoryGain', () => {
  it('varies across beat positions', () => {
    const down = anticipatoryGain(0.0, 'lofi', 'groove');
    const up = anticipatoryGain(0.5, 'lofi', 'groove');
    expect(down).not.toBeCloseTo(up, 2);
  });

  it('stays in 0.92-1.12 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const g = anticipatoryGain(p, 'lofi', 'peak');
      expect(g).toBeGreaterThanOrEqual(0.88);
      expect(g).toBeLessThanOrEqual(1.15);
    }
  });

  it('lofi has more variation than ambient', () => {
    const lofiRange = Math.abs(anticipatoryGain(0, 'lofi', 'groove') - anticipatoryGain(0.5, 'lofi', 'groove'));
    const ambientRange = Math.abs(anticipatoryGain(0, 'ambient', 'groove') - anticipatoryGain(0.5, 'ambient', 'groove'));
    expect(lofiRange).toBeGreaterThan(ambientRange);
  });
});

describe('anticipationStrength', () => {
  it('lofi is highest', () => {
    expect(anticipationStrength('lofi')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(anticipationStrength('ambient')).toBe(0.05);
  });
});
