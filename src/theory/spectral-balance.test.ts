import { describe, it, expect } from 'vitest';
import {
  spectralLpfMultiplier,
  spectralHpfOffset,
  shouldApplySpectralBalance,
  spectralSeparationStrength,
} from './spectral-balance';

const FULL = new Set(['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere']);
const SPARSE = new Set(['drone', 'melody']);

describe('spectralLpfMultiplier', () => {
  it('returns 1.0 for sparse layers', () => {
    expect(spectralLpfMultiplier('melody', SPARSE, 0.5, 'lofi')).toBe(1.0);
  });

  it('adjusts for full layer set', () => {
    const mult = spectralLpfMultiplier('harmony', FULL, 0.5, 'lofi');
    // Harmony is below median — should darken slightly
    expect(mult).toBeLessThan(1.0);
  });

  it('arp gets slightly brighter with many layers', () => {
    const mult = spectralLpfMultiplier('arp', FULL, 0.5, 'lofi');
    expect(mult).toBeGreaterThanOrEqual(1.0);
  });

  it('stays within 0.8-1.2 range', () => {
    for (const layer of FULL) {
      const mult = spectralLpfMultiplier(layer, FULL, 1.0, 'lofi');
      expect(mult).toBeGreaterThanOrEqual(0.8);
      expect(mult).toBeLessThanOrEqual(1.2);
    }
  });

  it('stronger mood produces more adjustment', () => {
    const lofi = spectralLpfMultiplier('harmony', FULL, 0.5, 'lofi');
    const ambient = spectralLpfMultiplier('harmony', FULL, 0.5, 'ambient');
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(ambient - 1.0));
  });
});

describe('spectralHpfOffset', () => {
  it('returns 0 for sparse layers', () => {
    expect(spectralHpfOffset('melody', SPARSE, 0.5, 'lofi')).toBe(0);
  });

  it('returns 0 for drone (low frequency)', () => {
    expect(spectralHpfOffset('drone', FULL, 0.5, 'lofi')).toBe(0);
  });

  it('returns positive for upper layers with lower neighbors', () => {
    const offset = spectralHpfOffset('arp', FULL, 0.5, 'lofi');
    expect(offset).toBeGreaterThan(0);
  });

  it('higher tension increases offset', () => {
    const low = spectralHpfOffset('melody', FULL, 0.0, 'lofi');
    const high = spectralHpfOffset('melody', FULL, 1.0, 'lofi');
    expect(high).toBeGreaterThan(low);
  });
});

describe('shouldApplySpectralBalance', () => {
  it('returns true for 3+ layers with non-ambient mood', () => {
    expect(shouldApplySpectralBalance('lofi', FULL)).toBe(true);
  });

  it('returns false for sparse layers', () => {
    expect(shouldApplySpectralBalance('lofi', SPARSE)).toBe(false);
  });

  it('returns true for ambient with 3+ layers', () => {
    const three = new Set(['drone', 'harmony', 'atmosphere']);
    expect(shouldApplySpectralBalance('ambient', three)).toBe(true);
  });
});

describe('spectralSeparationStrength', () => {
  it('lofi has strong separation', () => {
    expect(spectralSeparationStrength('lofi')).toBe(0.45);
  });

  it('ambient has weak separation', () => {
    expect(spectralSeparationStrength('ambient')).toBe(0.15);
  });
});
