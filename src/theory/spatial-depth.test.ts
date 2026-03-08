import { describe, it, expect } from 'vitest';
import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from './spatial-depth';

describe('roomMultiplier', () => {
  it('build section contracts reverb over time', () => {
    const start = roomMultiplier('build', 0, 0.3);
    const end = roomMultiplier('build', 1, 0.3);
    expect(end).toBeLessThan(start);
  });

  it('breakdown section expands reverb', () => {
    const start = roomMultiplier('breakdown', 0, 0.3);
    const end = roomMultiplier('breakdown', 1, 0.3);
    expect(end).toBeGreaterThan(start);
  });

  it('higher tension dries reverb', () => {
    const wet = roomMultiplier('groove', 0.5, 0.1);
    const dry = roomMultiplier('groove', 0.5, 0.9);
    expect(dry).toBeLessThan(wet);
  });

  it('never goes below 0.3', () => {
    const val = roomMultiplier('build', 1, 1.0);
    expect(val).toBeGreaterThanOrEqual(0.3);
  });

  it('returns reasonable values across all sections', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.25) {
        const val = roomMultiplier(section, p, 0.5);
        expect(val).toBeGreaterThanOrEqual(0.3);
        expect(val).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('roomsizeMultiplier', () => {
  it('build section shrinks space', () => {
    const start = roomsizeMultiplier('build', 0);
    const end = roomsizeMultiplier('build', 1);
    expect(end).toBeLessThan(start);
  });

  it('breakdown section grows space', () => {
    const start = roomsizeMultiplier('breakdown', 0);
    const end = roomsizeMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('clamps progress', () => {
    const normal = roomsizeMultiplier('peak', 1.0);
    const clamped = roomsizeMultiplier('peak', 1.5);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('shouldApplySpatialDepth', () => {
  it('returns true for build (significant change)', () => {
    expect(shouldApplySpatialDepth('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplySpatialDepth('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplySpatialDepth('intro')).toBe(true);
  });

  it('returns true for peak', () => {
    expect(shouldApplySpatialDepth('peak')).toBe(true);
  });
});
