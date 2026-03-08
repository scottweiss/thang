import { describe, it, expect } from 'vitest';
import {
  grainDensity,
  grainDecayMultiplier,
  granularityRange,
} from './texture-granularity';

describe('grainDensity', () => {
  it('peak is more granular than intro', () => {
    const peak = grainDensity('lofi', 'peak');
    const intro = grainDensity('lofi', 'intro');
    expect(peak).toBeGreaterThan(intro);
  });

  it('xtal is more granular than disco', () => {
    const xtal = grainDensity('xtal', 'build');
    const disco = grainDensity('disco', 'build');
    expect(xtal).toBeGreaterThan(disco);
  });

  it('stays in 0-1 range', () => {
    const d = grainDensity('xtal', 'peak');
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(1);
  });
});

describe('grainDecayMultiplier', () => {
  it('granular sections have shorter decay', () => {
    const peak = grainDecayMultiplier('xtal', 'peak');
    const intro = grainDecayMultiplier('xtal', 'intro');
    expect(peak).toBeLessThan(intro);
  });

  it('stays in 0.5-1.5 range', () => {
    const mul = grainDecayMultiplier('xtal', 'peak');
    expect(mul).toBeGreaterThanOrEqual(0.5);
    expect(mul).toBeLessThanOrEqual(1.5);
  });
});

describe('granularityRange', () => {
  it('xtal is highest', () => {
    expect(granularityRange('xtal')).toBe(0.65);
  });

  it('disco is low', () => {
    expect(granularityRange('disco')).toBe(0.25);
  });
});
