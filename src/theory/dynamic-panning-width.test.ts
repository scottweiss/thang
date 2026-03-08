import { describe, it, expect } from 'vitest';
import {
  panWidthMultiplier,
  widthRange,
} from './dynamic-panning-width';

describe('panWidthMultiplier', () => {
  it('peak is wider than intro', () => {
    const peak = panWidthMultiplier(0.8, 'ambient', 'peak');
    const intro = panWidthMultiplier(0.2, 'ambient', 'intro');
    expect(peak).toBeGreaterThan(intro);
  });

  it('high tension is wider', () => {
    const high = panWidthMultiplier(0.9, 'xtal', 'groove');
    const low = panWidthMultiplier(0.1, 'xtal', 'groove');
    expect(high).toBeGreaterThan(low);
  });

  it('stays in 0.5-1.3 range', () => {
    for (let t = 0; t <= 1.0; t += 0.2) {
      const mul = panWidthMultiplier(t, 'ambient', 'peak');
      expect(mul).toBeGreaterThanOrEqual(0.5);
      expect(mul).toBeLessThanOrEqual(1.3);
    }
  });

  it('wide mood has more range', () => {
    const ambientPeak = panWidthMultiplier(1.0, 'ambient', 'peak');
    const blockheadPeak = panWidthMultiplier(1.0, 'blockhead', 'peak');
    expect(ambientPeak).toBeGreaterThan(blockheadPeak);
  });
});

describe('widthRange', () => {
  it('ambient is highest', () => {
    expect(widthRange('ambient')).toBe(0.65);
  });

  it('syro is moderate', () => {
    expect(widthRange('syro')).toBe(0.30);
  });
});
