import { describe, it, expect } from 'vitest';
import {
  tempoFeelMultiplier,
  shouldApplyTempoFeel,
  tempoFeelDepth,
} from './tempo-feel';

describe('tempoFeelMultiplier', () => {
  it('returns close to 1.0', () => {
    for (let t = 0; t < 50; t++) {
      const mult = tempoFeelMultiplier(t, 'lofi', 'groove');
      expect(mult).toBeGreaterThan(0.95);
      expect(mult).toBeLessThan(1.05);
    }
  });

  it('fluctuates over time', () => {
    const values = Array.from({ length: 20 }, (_, t) =>
      tempoFeelMultiplier(t, 'lofi', 'groove')
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Should have some range of fluctuation
    expect(max - min).toBeGreaterThan(0.01);
  });

  it('trance has minimal fluctuation', () => {
    const values = Array.from({ length: 20 }, (_, t) =>
      tempoFeelMultiplier(t, 'trance', 'groove')
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(max - min).toBeLessThan(0.02);
  });

  it('lofi has more fluctuation than trance', () => {
    const lofiValues = Array.from({ length: 30 }, (_, t) =>
      tempoFeelMultiplier(t, 'lofi', 'groove')
    );
    const tranceValues = Array.from({ length: 30 }, (_, t) =>
      tempoFeelMultiplier(t, 'trance', 'groove')
    );

    const lofiRange = Math.max(...lofiValues) - Math.min(...lofiValues);
    const tranceRange = Math.max(...tranceValues) - Math.min(...tranceValues);
    expect(lofiRange).toBeGreaterThan(tranceRange);
  });

  it('breakdown amplifies fluctuation', () => {
    const groove = tempoFeelMultiplier(3, 'lofi', 'groove');
    const breakdown = tempoFeelMultiplier(3, 'lofi', 'breakdown');
    // At the same tick, breakdown should have more deviation from 1.0
    expect(Math.abs(breakdown - 1.0)).toBeGreaterThanOrEqual(Math.abs(groove - 1.0) * 0.9);
  });

  it('peak tightens fluctuation', () => {
    const values = Array.from({ length: 30 }, (_, t) =>
      tempoFeelMultiplier(t, 'lofi', 'peak')
    );
    const range = Math.max(...values) - Math.min(...values);
    // Peak should be tighter
    expect(range).toBeLessThan(0.05);
  });
});

describe('shouldApplyTempoFeel', () => {
  it('returns true for all moods', () => {
    const moods = ['lofi', 'trance', 'ambient', 'syro', 'disco'] as const;
    moods.forEach(m => expect(shouldApplyTempoFeel(m)).toBe(true));
  });
});

describe('tempoFeelDepth', () => {
  it('lofi has highest depth', () => {
    expect(tempoFeelDepth('lofi')).toBe(0.030);
  });

  it('trance has lowest depth', () => {
    expect(tempoFeelDepth('trance')).toBe(0.005);
  });
});
