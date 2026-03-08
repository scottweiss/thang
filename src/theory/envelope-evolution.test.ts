import { describe, it, expect } from 'vitest';
import { attackMultiplier, releaseMultiplier, shouldApplyEnvelopeEvolution } from './envelope-evolution';

describe('attackMultiplier', () => {
  it('build section gets punchier over time', () => {
    const start = attackMultiplier('build', 0);
    const end = attackMultiplier('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(1.0); // actually punchy
  });

  it('breakdown section gets softer over time', () => {
    const start = attackMultiplier('breakdown', 0);
    const end = attackMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(1.0); // actually softer
  });

  it('peak is punchy and stable', () => {
    const start = attackMultiplier('peak', 0);
    const end = attackMultiplier('peak', 1);
    expect(start).toBeLessThan(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('stays within 0.7-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = attackMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });

  it('clamps progress', () => {
    const normal = attackMultiplier('build', 1.0);
    const clamped = attackMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('releaseMultiplier', () => {
  it('build tightens release over time', () => {
    const start = releaseMultiplier('build', 0);
    const end = releaseMultiplier('build', 1);
    expect(end).toBeLessThan(start);
  });

  it('breakdown blooms release over time', () => {
    const start = releaseMultiplier('breakdown', 0);
    const end = releaseMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('stays within 0.7-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = releaseMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });
});

describe('shouldApplyEnvelopeEvolution', () => {
  it('returns true for build', () => {
    expect(shouldApplyEnvelopeEvolution('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplyEnvelopeEvolution('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplyEnvelopeEvolution('intro')).toBe(true);
  });

  it('returns false for peak (stable)', () => {
    expect(shouldApplyEnvelopeEvolution('peak')).toBe(false);
  });

  it('returns false for groove (minimal change)', () => {
    expect(shouldApplyEnvelopeEvolution('groove')).toBe(false);
  });
});
