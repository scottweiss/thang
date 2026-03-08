import { describe, it, expect } from 'vitest';
import {
  generateTimbreMap,
  slotProfile,
  shouldApplyKFM,
  kfmTendency,
  applyTimbreToFM,
  applyTimbreToLPF,
} from './klangfarbenmelodie';

describe('generateTimbreMap', () => {
  it('returns correct number of slots', () => {
    const map = generateTimbreMap(8, 'xtal', 'breakdown', 42);
    expect(map).toHaveLength(8);
  });

  it('is deterministic', () => {
    const a = generateTimbreMap(8, 'xtal', 'breakdown', 42);
    const b = generateTimbreMap(8, 'xtal', 'breakdown', 42);
    expect(a).toEqual(b);
  });

  it('xtal breakdown has more non-default slots than trance peak', () => {
    const xtalCount = generateTimbreMap(32, 'xtal', 'breakdown', 0)
      .filter(s => s !== 'default').length;
    const tranceCount = generateTimbreMap(32, 'trance', 'peak', 0)
      .filter(s => s !== 'default').length;
    expect(xtalCount).toBeGreaterThan(tranceCount);
  });

  it('contains only valid slot types', () => {
    const map = generateTimbreMap(16, 'syro', 'groove', 99);
    const valid = ['default', 'bright', 'dark', 'hollow'];
    for (const slot of map) {
      expect(valid).toContain(slot);
    }
  });

  it('returns all default for zero-length', () => {
    expect(generateTimbreMap(0, 'ambient', 'intro', 0)).toEqual([]);
  });
});

describe('slotProfile', () => {
  it('default has all multipliers at 1.0', () => {
    const p = slotProfile('default');
    expect(p.fmMult).toBe(1.0);
    expect(p.lpfMult).toBe(1.0);
    expect(p.attackMult).toBe(1.0);
  });

  it('bright has higher FM and LPF', () => {
    const p = slotProfile('bright');
    expect(p.fmMult).toBeGreaterThan(1.0);
    expect(p.lpfMult).toBeGreaterThan(1.0);
  });

  it('dark has lower FM and LPF', () => {
    const p = slotProfile('dark');
    expect(p.fmMult).toBeLessThan(1.0);
    expect(p.lpfMult).toBeLessThan(1.0);
  });

  it('returns a copy (not reference)', () => {
    const a = slotProfile('bright');
    const b = slotProfile('bright');
    a.fmMult = 999;
    expect(b.fmMult).not.toBe(999);
  });
});

describe('shouldApplyKFM', () => {
  it('true for xtal breakdown', () => {
    expect(shouldApplyKFM('xtal', 'breakdown')).toBe(true);
  });

  it('false for trance peak (tendency too low)', () => {
    // 0.02 * 0.4 = 0.008 < 0.08
    expect(shouldApplyKFM('trance', 'peak')).toBe(false);
  });

  it('true for ambient intro', () => {
    // 0.40 * 1.3 = 0.52 > 0.08
    expect(shouldApplyKFM('ambient', 'intro')).toBe(true);
  });
});

describe('kfmTendency', () => {
  it('xtal has highest tendency', () => {
    expect(kfmTendency('xtal')).toBe(0.45);
  });

  it('trance has lowest tendency', () => {
    expect(kfmTendency('trance')).toBe(0.02);
  });
});

describe('applyTimbreToFM', () => {
  it('default slot preserves FM', () => {
    expect(applyTimbreToFM(2.0, 'default')).toBe(2.0);
  });

  it('bright increases FM', () => {
    expect(applyTimbreToFM(2.0, 'bright')).toBeGreaterThan(2.0);
  });

  it('hollow nearly removes FM', () => {
    expect(applyTimbreToFM(2.0, 'hollow')).toBeLessThan(1.0);
  });
});

describe('applyTimbreToLPF', () => {
  it('default preserves LPF', () => {
    expect(applyTimbreToLPF(3000, 'default')).toBe(3000);
  });

  it('bright opens filter', () => {
    expect(applyTimbreToLPF(3000, 'bright')).toBeGreaterThan(3000);
  });

  it('dark closes filter', () => {
    expect(applyTimbreToLPF(3000, 'dark')).toBeLessThan(3000);
  });
});
