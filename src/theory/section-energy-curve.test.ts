import { describe, it, expect } from 'vitest';
import {
  sectionEnergyCurveGain,
  energyCurveDepth,
} from './section-energy-curve';

describe('sectionEnergyCurveGain', () => {
  it('build end is higher than build start', () => {
    const start = sectionEnergyCurveGain(0.1, 'trance', 'build');
    const end = sectionEnergyCurveGain(0.9, 'trance', 'build');
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown end is lower than start', () => {
    const start = sectionEnergyCurveGain(0.1, 'trance', 'breakdown');
    const end = sectionEnergyCurveGain(0.9, 'trance', 'breakdown');
    expect(end).toBeLessThan(start);
  });

  it('peak is near neutral (plateau)', () => {
    const gain = sectionEnergyCurveGain(0.5, 'trance', 'peak');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('trance has deeper curve than ambient', () => {
    const tr = sectionEnergyCurveGain(0.9, 'trance', 'build');
    const amb = sectionEnergyCurveGain(0.9, 'ambient', 'build');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 0.96-1.05 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const gain = sectionEnergyCurveGain(p, 'trance', 'build');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('energyCurveDepth', () => {
  it('trance is high', () => {
    expect(energyCurveDepth('trance')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(energyCurveDepth('syro')).toBe(0.25);
  });
});
