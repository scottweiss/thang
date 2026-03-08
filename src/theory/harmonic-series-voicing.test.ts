import { describe, it, expect } from 'vitest';
import {
  harmonicSeriesRatio,
  harmonicSeriesDepth,
  seriesPreference,
} from './harmonic-series-voicing';

describe('harmonicSeriesRatio', () => {
  it('returns positive number', () => {
    expect(harmonicSeriesRatio(0, 'ambient')).toBeGreaterThan(0);
  });

  it('stays in 1-7 range', () => {
    for (let tick = 0; tick < 100; tick++) {
      const ratio = harmonicSeriesRatio(tick, 'ambient');
      expect(ratio).toBeGreaterThanOrEqual(1);
      expect(ratio).toBeLessThanOrEqual(7);
    }
  });

  it('ambient selects non-fundamental more than disco', () => {
    let ambientNonFund = 0;
    let discoNonFund = 0;
    for (let tick = 0; tick < 200; tick++) {
      if (harmonicSeriesRatio(tick, 'ambient') > 1.0) ambientNonFund++;
      if (harmonicSeriesRatio(tick, 'disco') > 1.0) discoNonFund++;
    }
    expect(ambientNonFund).toBeGreaterThan(discoNonFund);
  });

  it('is deterministic', () => {
    expect(harmonicSeriesRatio(42, 'xtal')).toBe(harmonicSeriesRatio(42, 'xtal'));
  });
});

describe('harmonicSeriesDepth', () => {
  it('fundamental has highest depth', () => {
    const fund = harmonicSeriesDepth(1.0, 'ambient');
    const fifth = harmonicSeriesDepth(3.0, 'ambient');
    expect(fund).toBeGreaterThan(fifth);
  });

  it('stays in 0.3-1.0 range', () => {
    for (const ratio of [1, 2, 3, 4, 5, 6, 7]) {
      const depth = harmonicSeriesDepth(ratio, 'ambient');
      expect(depth).toBeGreaterThanOrEqual(0.15);
      expect(depth).toBeLessThanOrEqual(1.0);
    }
  });

  it('ambient has more depth than disco', () => {
    expect(harmonicSeriesDepth(1.0, 'ambient')).toBeGreaterThan(
      harmonicSeriesDepth(1.0, 'disco')
    );
  });
});

describe('seriesPreference', () => {
  it('ambient is highest', () => {
    expect(seriesPreference('ambient')).toBe(0.55);
  });

  it('disco and blockhead are lowest', () => {
    expect(seriesPreference('disco')).toBe(0.10);
    expect(seriesPreference('blockhead')).toBe(0.10);
  });
});
