import { describe, it, expect } from 'vitest';
import {
  closurePressure,
  tonicBias,
  shouldApplyClosure,
  closureStrength,
} from './tonal-closure';

describe('closurePressure', () => {
  it('start of section = minimal pressure', () => {
    const p = closurePressure(0, 'trance', 'groove');
    expect(p).toBeCloseTo(0, 1);
  });

  it('end of section = strong pressure', () => {
    const p = closurePressure(1.0, 'avril', 'breakdown');
    expect(p).toBeGreaterThan(0.4);
  });

  it('pressure increases with progress', () => {
    const early = closurePressure(0.3, 'lofi', 'groove');
    const late = closurePressure(0.8, 'lofi', 'groove');
    expect(late).toBeGreaterThan(early);
  });

  it('clamped to 1.0', () => {
    const p = closurePressure(1.0, 'avril', 'breakdown');
    expect(p).toBeLessThanOrEqual(1.0);
  });

  it('ambient has minimal pressure', () => {
    const p = closurePressure(0.9, 'ambient', 'groove');
    expect(p).toBeLessThan(0.1);
  });
});

describe('tonicBias', () => {
  it('zero pressure = no bias', () => {
    expect(tonicBias(0)).toBe(1.0);
  });

  it('full pressure = strong bias', () => {
    expect(tonicBias(1.0)).toBe(3.0);
  });

  it('half pressure = moderate bias', () => {
    expect(tonicBias(0.5)).toBe(2.0);
  });
});

describe('shouldApplyClosure', () => {
  it('trance applies', () => {
    expect(shouldApplyClosure('trance')).toBe(true);
  });

  it('ambient does not', () => {
    expect(shouldApplyClosure('ambient')).toBe(false);
  });
});

describe('closureStrength', () => {
  it('avril is highest', () => {
    expect(closureStrength('avril')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(closureStrength('ambient')).toBe(0.08);
  });
});
