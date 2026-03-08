import { describe, it, expect } from 'vitest';
import {
  releaseMultiplier,
  releaseSensitivity,
} from './sustain-release-curve';

describe('releaseMultiplier', () => {
  it('breakdown has long release', () => {
    const rel = releaseMultiplier('ambient', 'breakdown');
    expect(rel).toBeGreaterThan(1.0);
  });

  it('peak has short release', () => {
    const rel = releaseMultiplier('ambient', 'peak');
    expect(rel).toBeLessThan(1.0);
  });

  it('ambient has more variation than syro', () => {
    const ambBreak = releaseMultiplier('ambient', 'breakdown');
    const syroBreak = releaseMultiplier('syro', 'breakdown');
    expect(ambBreak).toBeGreaterThan(syroBreak);
  });

  it('stays in 0.70-1.40 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      const rel = releaseMultiplier('ambient', s);
      expect(rel).toBeGreaterThanOrEqual(0.70);
      expect(rel).toBeLessThanOrEqual(1.40);
    }
  });
});

describe('releaseSensitivity', () => {
  it('ambient is highest', () => {
    expect(releaseSensitivity('ambient')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(releaseSensitivity('syro')).toBe(0.25);
  });
});
