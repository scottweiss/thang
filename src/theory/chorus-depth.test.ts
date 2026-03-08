import { describe, it, expect } from 'vitest';
import { chorusDepth, shouldApplyChorus } from './chorus-depth';

describe('chorusDepth', () => {
  it('harmony gets most chorus at peak', () => {
    const depth = chorusDepth('harmony', 'peak', 1.0);
    expect(depth).toBeGreaterThanOrEqual(6);
    expect(depth).toBeLessThanOrEqual(8);
  });

  it('harmony builds from low to high in build section', () => {
    const start = chorusDepth('harmony', 'build', 0.0);
    const end = chorusDepth('harmony', 'build', 1.0);
    expect(end).toBeGreaterThan(start);
  });

  it('harmony cleans up during breakdown', () => {
    const start = chorusDepth('harmony', 'breakdown', 0.0);
    const end = chorusDepth('harmony', 'breakdown', 1.0);
    expect(end).toBeLessThan(start);
  });

  it('melody gets minimal chorus', () => {
    const peak = chorusDepth('melody', 'peak', 1.0);
    expect(peak).toBeLessThanOrEqual(3);
  });

  it('melody has less chorus than harmony in same section', () => {
    const melodyPeak = chorusDepth('melody', 'peak', 0.5);
    const harmonyPeak = chorusDepth('harmony', 'peak', 0.5);
    expect(melodyPeak).toBeLessThan(harmonyPeak);
  });

  it('drone gets no chorus', () => {
    expect(chorusDepth('drone', 'peak', 1.0)).toBe(0);
    expect(chorusDepth('drone', 'build', 0.5)).toBe(0);
  });

  it('texture gets no chorus', () => {
    expect(chorusDepth('texture', 'peak', 1.0)).toBe(0);
  });

  it('atmosphere gets no chorus', () => {
    expect(chorusDepth('atmosphere', 'build', 0.5)).toBe(0);
  });

  it('arp has moderate chorus at peak', () => {
    const depth = chorusDepth('arp', 'peak', 1.0);
    expect(depth).toBeGreaterThanOrEqual(3);
    expect(depth).toBeLessThanOrEqual(6);
  });

  it('clamps progress', () => {
    const normal = chorusDepth('harmony', 'build', 1.0);
    const over = chorusDepth('harmony', 'build', 2.0);
    expect(over).toEqual(normal);
  });
});

describe('shouldApplyChorus', () => {
  it('returns true for harmony in build', () => {
    expect(shouldApplyChorus('harmony', 'build')).toBe(true);
  });

  it('returns true for arp in peak', () => {
    expect(shouldApplyChorus('arp', 'peak')).toBe(true);
  });

  it('returns false for drone', () => {
    expect(shouldApplyChorus('drone', 'peak')).toBe(false);
  });

  it('returns false for texture', () => {
    expect(shouldApplyChorus('texture', 'build')).toBe(false);
  });

  it('returns false for melody in intro', () => {
    expect(shouldApplyChorus('melody', 'intro')).toBe(false);
  });

  it('returns true for melody in peak', () => {
    expect(shouldApplyChorus('melody', 'peak')).toBe(true);
  });
});
