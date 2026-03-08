import { describe, it, expect } from 'vitest';
import {
  harmonicThinning,
  thicknessGainReduction,
  thinningSensitivity,
} from './rhythmic-thinning';

describe('harmonicThinning', () => {
  it('no thinning for triads (3 voices)', () => {
    expect(harmonicThinning(3, 'lofi', 'build')).toBe(0);
  });

  it('thinning increases with voice count', () => {
    const four = harmonicThinning(4, 'lofi', 'build');
    const six = harmonicThinning(6, 'lofi', 'build');
    expect(six).toBeGreaterThan(four);
    expect(four).toBeGreaterThan(0);
  });

  it('lofi thins more than disco', () => {
    const lofi = harmonicThinning(5, 'lofi', 'build');
    const disco = harmonicThinning(5, 'disco', 'build');
    expect(lofi).toBeGreaterThan(disco);
  });

  it('intro thins more than peak', () => {
    const intro = harmonicThinning(5, 'lofi', 'intro');
    const peak = harmonicThinning(5, 'lofi', 'peak');
    expect(intro).toBeGreaterThan(peak);
  });

  it('stays in 0-0.6 range', () => {
    expect(harmonicThinning(6, 'ambient', 'intro')).toBeLessThanOrEqual(0.6);
    expect(harmonicThinning(1, 'disco', 'peak')).toBeGreaterThanOrEqual(0);
  });
});

describe('thicknessGainReduction', () => {
  it('no reduction for triads', () => {
    expect(thicknessGainReduction(3, 'lofi')).toBe(1.0);
  });

  it('reduces for thick voicings', () => {
    expect(thicknessGainReduction(5, 'lofi')).toBeLessThan(1.0);
  });

  it('stays above 0.7', () => {
    expect(thicknessGainReduction(6, 'ambient')).toBeGreaterThanOrEqual(0.7);
  });
});

describe('thinningSensitivity', () => {
  it('ambient is highest', () => {
    expect(thinningSensitivity('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(thinningSensitivity('disco')).toBe(0.15);
  });
});
