import { describe, it, expect } from 'vitest';
import {
  availablePitchRange,
  rangeEdgeGain,
  baseRange,
} from './pitch-range-expansion';

describe('availablePitchRange', () => {
  it('low tension gives narrow range', () => {
    const range = availablePitchRange(0, 'avril');
    expect(range).toBeLessThan(2.0);
  });

  it('high tension gives wider range', () => {
    const low = availablePitchRange(0.1, 'avril');
    const high = availablePitchRange(0.9, 'avril');
    expect(high).toBeGreaterThan(low);
  });

  it('stays in 0.8-4.0 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const range = availablePitchRange(t, 'xtal');
      expect(range).toBeGreaterThanOrEqual(0.8);
      expect(range).toBeLessThanOrEqual(4.0);
    }
  });

  it('syro starts wide', () => {
    expect(availablePitchRange(0, 'syro')).toBeGreaterThanOrEqual(2.0);
  });
});

describe('rangeEdgeGain', () => {
  it('center of range is full gain', () => {
    expect(rangeEdgeGain(0.5, 0.5, 'trance')).toBe(1.0);
  });

  it('edges are reduced', () => {
    const edge = rangeEdgeGain(0, 0.5, 'trance');
    const center = rangeEdgeGain(0.5, 0.5, 'trance');
    expect(edge).toBeLessThan(center);
  });

  it('stays in 0.85-1.0 range', () => {
    const gain = rangeEdgeGain(0, 1.0, 'ambient');
    expect(gain).toBeGreaterThanOrEqual(0.85);
    expect(gain).toBeLessThanOrEqual(1.0);
  });
});

describe('baseRange', () => {
  it('syro is wide', () => {
    expect(baseRange('syro')).toBe(2.0);
  });

  it('xtal is narrow', () => {
    expect(baseRange('xtal')).toBe(0.8);
  });
});
