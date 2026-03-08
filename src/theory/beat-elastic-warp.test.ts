import { describe, it, expect } from 'vitest';
import {
  beatWarpMultiplier,
  shouldApplyBeatWarp,
  warpRange,
} from './beat-elastic-warp';

describe('beatWarpMultiplier', () => {
  it('1.0 at start of groove (neutral)', () => {
    expect(beatWarpMultiplier(0, 'lofi', 'groove')).toBe(1.0);
  });

  it('builds speed up with progress', () => {
    const early = beatWarpMultiplier(0.2, 'lofi', 'build');
    const late = beatWarpMultiplier(0.8, 'lofi', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('breakdowns slow down with progress', () => {
    const early = beatWarpMultiplier(0.2, 'lofi', 'breakdown');
    const late = beatWarpMultiplier(0.8, 'lofi', 'breakdown');
    expect(late).toBeLessThan(early);
  });

  it('clamped within warp range', () => {
    const range = warpRange('lofi');
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const mult = beatWarpMultiplier(1.0, 'lofi', section);
      expect(mult).toBeGreaterThanOrEqual(1.0 - range);
      expect(mult).toBeLessThanOrEqual(1.0 + range);
    }
  });

  it('lofi has wider warp than trance', () => {
    const lofiWarp = Math.abs(beatWarpMultiplier(1.0, 'lofi', 'build') - 1.0);
    const tranceWarp = Math.abs(beatWarpMultiplier(1.0, 'trance', 'build') - 1.0);
    expect(lofiWarp).toBeGreaterThan(tranceWarp);
  });
});

describe('shouldApplyBeatWarp', () => {
  it('lofi applies', () => {
    expect(shouldApplyBeatWarp('lofi')).toBe(true);
  });

  it('ambient applies (barely)', () => {
    expect(shouldApplyBeatWarp('ambient')).toBe(true);
  });
});

describe('warpRange', () => {
  it('lofi is widest', () => {
    expect(warpRange('lofi')).toBe(0.07);
  });

  it('ambient is narrowest', () => {
    expect(warpRange('ambient')).toBe(0.02);
  });
});
