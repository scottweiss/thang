import { describe, it, expect } from 'vitest';
import {
  temporalDensityWaveGain,
  densityWaveAmplitude,
} from './temporal-density-wave';

describe('temporalDensityWaveGain', () => {
  it('produces variation over time', () => {
    const values = new Set<string>();
    for (let t = 0; t < 30; t++) {
      values.add(temporalDensityWaveGain(t, 0, 'ambient').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(3);
  });

  it('different layers have different phases', () => {
    const a = temporalDensityWaveGain(10, 0, 'ambient');
    const b = temporalDensityWaveGain(10, 3, 'ambient');
    expect(a).not.toBeCloseTo(b, 3);
  });

  it('ambient has wider range than disco', () => {
    let ambMin = 2, ambMax = 0, diMin = 2, diMax = 0;
    for (let t = 0; t < 200; t++) {
      const a = temporalDensityWaveGain(t, 0, 'ambient');
      const d = temporalDensityWaveGain(t, 0, 'disco');
      ambMin = Math.min(ambMin, a); ambMax = Math.max(ambMax, a);
      diMin = Math.min(diMin, d); diMax = Math.max(diMax, d);
    }
    expect(ambMax - ambMin).toBeGreaterThan(diMax - diMin);
  });

  it('stays in 0.97-1.03 range', () => {
    for (let t = 0; t < 200; t++) {
      for (let l = 0; l < 6; l++) {
        const gain = temporalDensityWaveGain(t, l, 'ambient');
        expect(gain).toBeGreaterThanOrEqual(0.97);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('densityWaveAmplitude', () => {
  it('ambient is highest', () => {
    expect(densityWaveAmplitude('ambient')).toBe(0.50);
  });

  it('disco is lowest', () => {
    expect(densityWaveAmplitude('disco')).toBe(0.15);
  });
});
