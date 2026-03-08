import { describe, it, expect } from 'vitest';
import {
  bassLayerCount,
  bassHpfCorrection,
  bassGainCorrection,
  bassTolerance,
} from './bass-weight';

describe('bassLayerCount', () => {
  it('counts layers below threshold', () => {
    expect(bassLayerCount({ drone: 36, harmony: 55, melody: 65 })).toBe(1);
  });

  it('multiple bass layers', () => {
    expect(bassLayerCount({ drone: 36, harmony: 40, melody: 65 })).toBe(2);
  });

  it('none below threshold', () => {
    expect(bassLayerCount({ melody: 60, arp: 72 })).toBe(0);
  });
});

describe('bassHpfCorrection', () => {
  it('single bass layer = no correction', () => {
    expect(bassHpfCorrection(1, 'lofi', false)).toBe(0);
  });

  it('main bass never gets HPF', () => {
    expect(bassHpfCorrection(3, 'lofi', true)).toBe(0);
  });

  it('secondary bass gets HPF when 2+ bass layers', () => {
    const hpf = bassHpfCorrection(2, 'ambient', false);
    expect(hpf).toBeGreaterThan(0);
  });

  it('more bass layers = more HPF', () => {
    const two = bassHpfCorrection(2, 'lofi', false);
    const three = bassHpfCorrection(3, 'lofi', false);
    expect(three).toBeGreaterThan(two);
  });

  it('downtempo is more tolerant (less HPF)', () => {
    const dt = bassHpfCorrection(2, 'downtempo', false);
    const ambient = bassHpfCorrection(2, 'ambient', false);
    expect(dt).toBeLessThan(ambient);
  });
});

describe('bassGainCorrection', () => {
  it('single bass = no correction', () => {
    expect(bassGainCorrection(1, 'lofi', false)).toBe(1.0);
  });

  it('main bass always full gain', () => {
    expect(bassGainCorrection(3, 'lofi', true)).toBe(1.0);
  });

  it('secondary bass reduced with 2+ bass layers', () => {
    expect(bassGainCorrection(2, 'ambient', false)).toBeLessThan(1.0);
  });

  it('clamped above 0.6', () => {
    expect(bassGainCorrection(5, 'ambient', false)).toBeGreaterThanOrEqual(0.6);
  });
});

describe('bassTolerance', () => {
  it('downtempo is most tolerant', () => {
    expect(bassTolerance('downtempo')).toBe(0.60);
  });

  it('ambient is least tolerant', () => {
    expect(bassTolerance('ambient')).toBe(0.25);
  });
});
