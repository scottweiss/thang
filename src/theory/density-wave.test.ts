import { describe, it, expect } from 'vitest';
import {
  densityWaveMultiplier,
  shouldApplyDensityWave,
  waveAmplitude,
  wavePeriod,
} from './density-wave';

describe('densityWaveMultiplier', () => {
  it('oscillates around 1.0', () => {
    let min = 2, max = 0;
    for (let t = 0; t < 20; t++) {
      const m = densityWaveMultiplier(t, 'lofi', 'groove');
      if (m < min) min = m;
      if (m > max) max = m;
    }
    expect(min).toBeLessThan(1.0);
    expect(max).toBeGreaterThan(1.0);
  });

  it('at tick 0 starts near 1.0', () => {
    const m = densityWaveMultiplier(0, 'lofi', 'groove');
    expect(m).toBeCloseTo(1.0, 1);
  });

  it('ambient has larger swings', () => {
    let ambientRange = 0, tranceRange = 0;
    for (let t = 0; t < 30; t++) {
      const a = densityWaveMultiplier(t, 'ambient', 'breakdown');
      const tr = densityWaveMultiplier(t, 'trance', 'breakdown');
      ambientRange = Math.max(ambientRange, Math.abs(a - 1.0));
      tranceRange = Math.max(tranceRange, Math.abs(tr - 1.0));
    }
    expect(ambientRange).toBeGreaterThan(tranceRange);
  });

  it('breakdown has larger swings than peak', () => {
    let bdRange = 0, pkRange = 0;
    for (let t = 0; t < 20; t++) {
      bdRange = Math.max(bdRange, Math.abs(densityWaveMultiplier(t, 'lofi', 'breakdown') - 1.0));
      pkRange = Math.max(pkRange, Math.abs(densityWaveMultiplier(t, 'lofi', 'peak') - 1.0));
    }
    expect(bdRange).toBeGreaterThan(pkRange);
  });
});

describe('shouldApplyDensityWave', () => {
  it('lofi in groove applies', () => {
    expect(shouldApplyDensityWave('lofi', 'groove')).toBe(true);
  });

  it('trance in peak may not apply', () => {
    // 0.08 * 0.5 = 0.04 < 0.05
    expect(shouldApplyDensityWave('trance', 'peak')).toBe(false);
  });
});

describe('waveAmplitude', () => {
  it('ambient is highest', () => {
    expect(waveAmplitude('ambient')).toBe(0.25);
  });

  it('trance is lowest', () => {
    expect(waveAmplitude('trance')).toBe(0.08);
  });
});

describe('wavePeriod', () => {
  it('ambient is slowest', () => {
    expect(wavePeriod('ambient')).toBe(20);
  });

  it('disco is fastest', () => {
    expect(wavePeriod('disco')).toBe(6);
  });
});
