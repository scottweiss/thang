import { describe, it, expect } from 'vitest';
import {
  estimateMetabolism,
  metabolismDensityCorrection,
  metabolismFatigue,
  shouldAdjustMetabolism,
  targetMetabolism,
} from './event-metabolism';

describe('estimateMetabolism', () => {
  it('0 with no layers', () => {
    expect(estimateMetabolism([], 4)).toBe(0);
  });

  it('proportional to density and subdivisions', () => {
    expect(estimateMetabolism([0.5], 4)).toBe(2.0);
  });

  it('sums across layers', () => {
    expect(estimateMetabolism([0.5, 0.5], 4)).toBe(4.0);
  });

  it('higher subdivisions = higher metabolism', () => {
    const sub4 = estimateMetabolism([0.5], 4);
    const sub8 = estimateMetabolism([0.5], 8);
    expect(sub8).toBeGreaterThan(sub4);
  });
});

describe('metabolismDensityCorrection', () => {
  it('~1.0 at target metabolism', () => {
    const target = targetMetabolism('trance');
    const corr = metabolismDensityCorrection(target, 'trance', 'peak');
    expect(corr).toBeCloseTo(1.0, 1);
  });

  it('> 1.0 when metabolism too low (needs more density)', () => {
    expect(metabolismDensityCorrection(0.5, 'trance', 'peak')).toBeGreaterThan(1.0);
  });

  it('< 1.0 when metabolism too high (needs less density)', () => {
    expect(metabolismDensityCorrection(10, 'ambient', 'peak')).toBeLessThan(1.0);
  });

  it('clamped 0.7-1.3', () => {
    expect(metabolismDensityCorrection(0.01, 'syro', 'peak')).toBeLessThanOrEqual(1.3);
    expect(metabolismDensityCorrection(100, 'ambient', 'peak')).toBeGreaterThanOrEqual(0.7);
  });
});

describe('metabolismFatigue', () => {
  it('0 at low metabolism', () => {
    expect(metabolismFatigue(1.0, 'trance')).toBe(0);
  });

  it('> 0 above fatigue threshold', () => {
    expect(metabolismFatigue(6.5, 'trance')).toBeGreaterThan(0);
  });

  it('ambient fatigues earlier than syro', () => {
    const amb = metabolismFatigue(3.0, 'ambient');
    const syro = metabolismFatigue(3.0, 'syro');
    expect(amb).toBeGreaterThan(syro);
  });

  it('clamped at 1', () => {
    expect(metabolismFatigue(20, 'ambient')).toBeLessThanOrEqual(1);
  });
});

describe('shouldAdjustMetabolism', () => {
  it('false near target', () => {
    const target = targetMetabolism('lofi');
    expect(shouldAdjustMetabolism(target * 1.1, 'lofi', 'peak')).toBe(false);
  });

  it('true when far from target', () => {
    expect(shouldAdjustMetabolism(10, 'ambient', 'peak')).toBe(true);
  });
});

describe('targetMetabolism', () => {
  it('syro is highest', () => {
    expect(targetMetabolism('syro')).toBe(4.5);
  });

  it('ambient is lowest', () => {
    expect(targetMetabolism('ambient')).toBe(1.2);
  });
});
