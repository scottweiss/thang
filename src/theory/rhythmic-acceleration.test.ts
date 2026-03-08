import { describe, it, expect } from 'vitest';
import { slowMultiplier, shouldApplyRhythmicAcceleration } from './rhythmic-acceleration';

describe('slowMultiplier', () => {
  it('returns 1.0 for stable sections', () => {
    expect(slowMultiplier('arp', 'intro', 0.5)).toBe(1.0);
    expect(slowMultiplier('arp', 'groove', 0.5)).toBe(1.0);
    expect(slowMultiplier('melody', 'intro', 0.5)).toBe(1.0);
  });

  it('arp speeds up during builds (multiplier decreases)', () => {
    const start = slowMultiplier('arp', 'build', 0.0);
    const mid = slowMultiplier('arp', 'build', 0.5);
    const end = slowMultiplier('arp', 'build', 1.0);
    expect(start).toBe(1.0);
    expect(mid).toBeLessThan(start);
    expect(end).toBeLessThan(mid);
    expect(end).toBeCloseTo(0.65, 2);
  });

  it('arp slows during breakdowns (multiplier increases)', () => {
    const start = slowMultiplier('arp', 'breakdown', 0.0);
    const end = slowMultiplier('arp', 'breakdown', 1.0);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeCloseTo(1.3, 2);
  });

  it('melody has moderate acceleration in builds', () => {
    const end = slowMultiplier('melody', 'build', 1.0);
    expect(end).toBeCloseTo(0.85, 2);
    // Less extreme than arp
    const arpEnd = slowMultiplier('arp', 'build', 1.0);
    expect(end).toBeGreaterThan(arpEnd);
  });

  it('harmony has minimal acceleration', () => {
    const end = slowMultiplier('harmony', 'build', 1.0);
    expect(end).toBeCloseTo(0.95, 2);
  });

  it('drone is always stable', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      expect(slowMultiplier('drone', section, 0.5)).toBe(1.0);
    }
  });

  it('atmosphere is always stable', () => {
    expect(slowMultiplier('atmosphere', 'build', 1.0)).toBe(1.0);
    expect(slowMultiplier('atmosphere', 'peak', 0.5)).toBe(1.0);
  });

  it('clamps progress to 0-1', () => {
    const normal = slowMultiplier('arp', 'build', 1.0);
    const over = slowMultiplier('arp', 'build', 2.0);
    expect(over).toEqual(normal);
  });

  it('unknown layer returns stable', () => {
    expect(slowMultiplier('unknown', 'build', 1.0)).toBe(1.0);
  });

  it('peak keeps arp fast', () => {
    const peak = slowMultiplier('arp', 'peak', 0.5);
    expect(peak).toBeLessThan(0.8);
    expect(peak).toBeGreaterThan(0.6);
  });
});

describe('shouldApplyRhythmicAcceleration', () => {
  it('returns true for arp in build', () => {
    expect(shouldApplyRhythmicAcceleration('arp', 'build')).toBe(true);
  });

  it('returns true for texture in build', () => {
    expect(shouldApplyRhythmicAcceleration('texture', 'build')).toBe(true);
  });

  it('returns true for arp in breakdown', () => {
    expect(shouldApplyRhythmicAcceleration('arp', 'breakdown')).toBe(true);
  });

  it('returns false for arp in groove', () => {
    expect(shouldApplyRhythmicAcceleration('arp', 'groove')).toBe(false);
  });

  it('returns false for drone in any section', () => {
    expect(shouldApplyRhythmicAcceleration('drone', 'build')).toBe(false);
    expect(shouldApplyRhythmicAcceleration('drone', 'peak')).toBe(false);
  });

  it('returns false for atmosphere', () => {
    expect(shouldApplyRhythmicAcceleration('atmosphere', 'build')).toBe(false);
  });

  it('returns true for melody in build', () => {
    expect(shouldApplyRhythmicAcceleration('melody', 'build')).toBe(true);
  });

  it('returns false for harmony in groove', () => {
    expect(shouldApplyRhythmicAcceleration('harmony', 'groove')).toBe(false);
  });
});
