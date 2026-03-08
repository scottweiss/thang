import { describe, it, expect } from 'vitest';
import {
  entrainedOffset,
  shouldEntrain,
  entrainmentRate,
} from './rhythmic-entrainment';

describe('entrainedOffset', () => {
  it('pulls toward target over time', () => {
    const corrected = entrainedOffset(0.1, 0, 0.5, 'trance', 'peak');
    expect(corrected).toBeLessThan(0.1);
    expect(corrected).toBeGreaterThan(0);
  });

  it('more correction at end of section', () => {
    const early = entrainedOffset(0.1, 0, 0.2, 'trance', 'build');
    const late = entrainedOffset(0.1, 0, 0.8, 'trance', 'build');
    expect(late).toBeLessThan(early);
  });

  it('trance entrains faster than ambient', () => {
    const trance = entrainedOffset(0.1, 0, 0.5, 'trance', 'build');
    const ambient = entrainedOffset(0.1, 0, 0.5, 'ambient', 'build');
    expect(trance).toBeLessThan(ambient);
  });

  it('no correction at section start', () => {
    const corrected = entrainedOffset(0.1, 0, 0, 'trance', 'peak');
    expect(corrected).toBeCloseTo(0.1, 2);
  });
});

describe('shouldEntrain', () => {
  it('true for trance at peak', () => {
    expect(shouldEntrain('trance', 'peak')).toBe(true);
  });

  it('false for ambient at intro', () => {
    expect(shouldEntrain('ambient', 'intro')).toBe(false);
  });
});

describe('entrainmentRate', () => {
  it('trance is highest', () => {
    expect(entrainmentRate('trance')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(entrainmentRate('ambient')).toBe(0.10);
  });
});
