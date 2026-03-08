import { describe, it, expect } from 'vitest';
import {
  intervallicTensionCurveFm,
  tensionCurveDepthValue,
} from './melodic-intervallic-tension-curve';

describe('intervallicTensionCurveFm', () => {
  it('unison is neutral', () => {
    const fm = intervallicTensionCurveFm(0, 'syro', 'peak');
    expect(fm).toBe(1.0);
  });

  it('tritone gets most FM', () => {
    const fm = intervallicTensionCurveFm(6, 'syro', 'peak');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('perfect 5th gets minimal FM', () => {
    const fifth = intervallicTensionCurveFm(7, 'syro', 'peak');
    const tritone = intervallicTensionCurveFm(6, 'syro', 'peak');
    expect(tritone).toBeGreaterThan(fifth);
  });

  it('minor 2nd is highly tense', () => {
    const m2 = intervallicTensionCurveFm(1, 'syro', 'peak');
    const M3 = intervallicTensionCurveFm(4, 'syro', 'peak');
    expect(m2).toBeGreaterThan(M3);
  });

  it('syro colors more than disco', () => {
    const sy = intervallicTensionCurveFm(6, 'syro', 'peak');
    const di = intervallicTensionCurveFm(6, 'disco', 'peak');
    expect(sy).toBeGreaterThan(di);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let i = 0; i <= 12; i++) {
      const fm = intervallicTensionCurveFm(i, 'syro', 'peak');
      expect(fm).toBeGreaterThanOrEqual(1.0);
      expect(fm).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('tensionCurveDepthValue', () => {
  it('syro is highest', () => {
    expect(tensionCurveDepthValue('syro')).toBe(0.55);
  });

  it('disco is lowest', () => {
    expect(tensionCurveDepthValue('disco')).toBe(0.20);
  });
});
