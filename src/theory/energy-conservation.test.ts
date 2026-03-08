import { describe, it, expect } from 'vitest';
import {
  energyConservationGain,
  energyCeiling,
} from './energy-conservation';

describe('energyConservationGain', () => {
  it('quiet layers return 1.0', () => {
    const gain = energyConservationGain([0.3, 0.3, 0.3], 'ambient');
    expect(gain).toBe(1.0);
  });

  it('loud layers get compressed', () => {
    const gain = energyConservationGain([0.9, 0.9, 0.9, 0.9], 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient compresses more than disco', () => {
    const layers = [0.8, 0.8, 0.8, 0.8];
    const amb = energyConservationGain(layers, 'ambient');
    const dis = energyConservationGain(layers, 'disco');
    expect(amb).toBeLessThanOrEqual(dis);
  });

  it('stays in 0.70-1.0 range', () => {
    const gain = energyConservationGain([1.0, 1.0, 1.0, 1.0, 1.0, 1.0], 'ambient');
    expect(gain).toBeGreaterThanOrEqual(0.70);
    expect(gain).toBeLessThanOrEqual(1.0);
  });

  it('empty layers return 1.0', () => {
    expect(energyConservationGain([], 'trance')).toBe(1.0);
  });
});

describe('energyCeiling', () => {
  it('disco is highest', () => {
    expect(energyCeiling('disco')).toBe(0.90);
  });

  it('ambient is lowest', () => {
    expect(energyCeiling('ambient')).toBe(0.55);
  });
});
