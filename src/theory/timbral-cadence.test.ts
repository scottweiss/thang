import { describe, it, expect } from 'vitest';
import {
  fmIndexMultiplier,
  harmonicRatioBias,
  cadentialLpf,
  isResolutionChord,
  timbralCadenceStrength,
} from './timbral-cadence';

describe('fmIndexMultiplier', () => {
  it('resolution reduces FM index', () => {
    const resolved = fmIndexMultiplier(0.5, true, 'trance');
    const unresolved = fmIndexMultiplier(0.5, false, 'trance');
    expect(resolved).toBeLessThan(unresolved);
  });

  it('high tension increases FM index', () => {
    const low = fmIndexMultiplier(0.2, false, 'trance');
    const high = fmIndexMultiplier(0.9, false, 'trance');
    expect(high).toBeGreaterThan(low);
  });

  it('ambient has minimal effect', () => {
    const resolved = fmIndexMultiplier(0.5, true, 'ambient');
    const unresolved = fmIndexMultiplier(0.5, false, 'ambient');
    expect(Math.abs(resolved - unresolved)).toBeLessThan(0.15);
  });
});

describe('harmonicRatioBias', () => {
  it('resolution pulls toward nearest integer ratio', () => {
    // 2.3 rounds to 2, so it should be pulled lower
    const resolved = harmonicRatioBias(2.3, 0.5, true, 'trance');
    expect(resolved).toBeLessThan(2.3);
    expect(resolved).toBeGreaterThanOrEqual(2.0);
  });

  it('no change without resolution for low tension', () => {
    const result = harmonicRatioBias(2.0, 0.3, false, 'trance');
    expect(result).toBe(2.0);
  });

  it('high tension adds slight inharmonicity', () => {
    const result = harmonicRatioBias(3.0, 0.9, false, 'trance');
    expect(result).not.toBe(3.0);
  });
});

describe('cadentialLpf', () => {
  it('resolution warms (lowers LPF)', () => {
    const resolved = cadentialLpf(5000, 0.5, true, 'trance');
    expect(resolved).toBeLessThan(5000);
  });

  it('tension brightens (raises LPF)', () => {
    const bright = cadentialLpf(5000, 0.9, false, 'trance');
    expect(bright).toBeGreaterThan(5000);
  });

  it('ambient barely changes', () => {
    const resolved = cadentialLpf(5000, 0.5, true, 'ambient');
    expect(Math.abs(resolved - 5000)).toBeLessThan(200);
  });
});

describe('isResolutionChord', () => {
  it('V to I is resolution', () => {
    expect(isResolutionChord(1, 5)).toBe(true);
  });

  it('vii to I is resolution', () => {
    expect(isResolutionChord(1, 7)).toBe(true);
  });

  it('IV to I is not resolution', () => {
    expect(isResolutionChord(1, 4)).toBe(false);
  });

  it('null previous is not resolution', () => {
    expect(isResolutionChord(1, null)).toBe(false);
  });

  it('I to V is not resolution', () => {
    expect(isResolutionChord(5, 1)).toBe(false);
  });
});

describe('timbralCadenceStrength', () => {
  it('trance has highest', () => {
    expect(timbralCadenceStrength('trance')).toBe(0.50);
  });

  it('ambient has lowest', () => {
    expect(timbralCadenceStrength('ambient')).toBe(0.08);
  });
});
