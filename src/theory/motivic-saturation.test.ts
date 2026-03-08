import { describe, it, expect } from 'vitest';
import {
  saturationLevel,
  motifInjectionCount,
  selectMotifFragment,
  saturatedLayers,
  shouldApplySaturation,
  saturationTendency,
} from './motivic-saturation';

describe('saturationLevel', () => {
  it('peak trance at high tension = high saturation', () => {
    const level = saturationLevel('trance', 'peak', 0.9, 0.9);
    expect(level).toBeGreaterThan(0.5);
  });

  it('intro ambient at low tension = low saturation', () => {
    const level = saturationLevel('ambient', 'intro', 0.1, 0.1);
    expect(level).toBeLessThan(0.1);
  });

  it('increases with section progress', () => {
    const early = saturationLevel('avril', 'build', 0.1, 0.5);
    const late = saturationLevel('avril', 'build', 0.9, 0.5);
    expect(late).toBeGreaterThan(early);
  });

  it('increases with tension', () => {
    const low = saturationLevel('trance', 'peak', 0.5, 0.2);
    const high = saturationLevel('trance', 'peak', 0.5, 0.9);
    expect(high).toBeGreaterThan(low);
  });

  it('clamps to 1.0', () => {
    const level = saturationLevel('trance', 'peak', 1.0, 1.0);
    expect(level).toBeLessThanOrEqual(1.0);
  });
});

describe('motifInjectionCount', () => {
  it('zero at low saturation', () => {
    expect(motifInjectionCount(0.05, 8)).toBe(0);
  });

  it('increases with saturation', () => {
    const low = motifInjectionCount(0.2, 8);
    const high = motifInjectionCount(0.8, 8);
    expect(high).toBeGreaterThan(low);
  });

  it('scales with motif length', () => {
    const short = motifInjectionCount(0.5, 4);
    const long = motifInjectionCount(0.5, 12);
    expect(long).toBeGreaterThanOrEqual(short);
  });

  it('returns 0 for empty motif', () => {
    expect(motifInjectionCount(0.8, 0)).toBe(0);
  });
});

describe('selectMotifFragment', () => {
  const motif = ['C4', 'E4', '~', 'G4', 'A4', 'G4', 'E4', 'C4'];

  it('returns empty for count 0', () => {
    expect(selectMotifFragment(motif, 0, 42)).toEqual([]);
  });

  it('returns head note for count 1', () => {
    const result = selectMotifFragment(motif, 1, 42);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('C4');
  });

  it('returns correct count', () => {
    const result = selectMotifFragment(motif, 3, 42);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });

  it('skips rests', () => {
    const result = selectMotifFragment(['~', '~', 'C4'], 1, 42);
    expect(result[0]).toBe('C4');
  });

  it('handles all-rest motif', () => {
    expect(selectMotifFragment(['~', '~'], 2, 42)).toEqual([]);
  });
});

describe('saturatedLayers', () => {
  it('empty at very low saturation', () => {
    expect(saturatedLayers(0.1)).toEqual([]);
  });

  it('arp first', () => {
    expect(saturatedLayers(0.2)).toContain('arp');
    expect(saturatedLayers(0.2)).not.toContain('harmony');
  });

  it('harmony joins at medium', () => {
    expect(saturatedLayers(0.4)).toContain('arp');
    expect(saturatedLayers(0.4)).toContain('harmony');
  });

  it('caps at arp + harmony at high saturation', () => {
    const layers = saturatedLayers(0.8);
    expect(layers).toContain('arp');
    expect(layers).toContain('harmony');
    expect(layers).toHaveLength(2); // drone/atmosphere excluded — sustained tones
  });
});

describe('shouldApplySaturation', () => {
  it('is deterministic', () => {
    const a = shouldApplySaturation(42, 'trance', 'peak');
    const b = shouldApplySaturation(42, 'trance', 'peak');
    expect(a).toBe(b);
  });

  it('trance peak has more than ambient intro', () => {
    const tranceCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplySaturation(i, 'trance', 'peak')
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplySaturation(i, 'ambient', 'intro')
    ).filter(Boolean).length;
    expect(tranceCount).toBeGreaterThan(ambientCount);
  });
});

describe('saturationTendency', () => {
  it('trance has highest', () => {
    expect(saturationTendency('trance')).toBe(0.55);
  });

  it('ambient has lowest', () => {
    expect(saturationTendency('ambient')).toBe(0.05);
  });
});
