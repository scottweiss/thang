import { describe, it, expect } from 'vitest';
import { delayWetMultiplier, delayFeedbackMultiplier, shouldApplyDelayEvolution } from './delay-evolution';

describe('delayWetMultiplier', () => {
  it('build section increases delay wet over time', () => {
    const start = delayWetMultiplier('build', 0);
    const end = delayWetMultiplier('build', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown section increases delay wet', () => {
    const start = delayWetMultiplier('breakdown', 0);
    const end = delayWetMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('peak section stays relatively stable', () => {
    const start = delayWetMultiplier('peak', 0);
    const end = delayWetMultiplier('peak', 1);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('clamps progress to 0-1', () => {
    const normal = delayWetMultiplier('build', 1.0);
    const clamped = delayWetMultiplier('build', 1.5);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('delayFeedbackMultiplier', () => {
  it('build section increases feedback over time', () => {
    const start = delayFeedbackMultiplier('build', 0);
    const end = delayFeedbackMultiplier('build', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown creates vast trails (high feedback)', () => {
    const end = delayFeedbackMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(1.2);
  });

  it('never exceeds safety cap of 1.4', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        expect(delayFeedbackMultiplier(section, p)).toBeLessThanOrEqual(1.4);
      }
    }
  });

  it('peak section reduces feedback slightly', () => {
    const start = delayFeedbackMultiplier('peak', 0);
    const end = delayFeedbackMultiplier('peak', 1);
    expect(end).toBeLessThanOrEqual(start);
  });
});

describe('shouldApplyDelayEvolution', () => {
  it('returns true for build', () => {
    expect(shouldApplyDelayEvolution('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplyDelayEvolution('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplyDelayEvolution('intro')).toBe(true);
  });
});
