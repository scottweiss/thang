import { describe, it, expect } from 'vitest';
import {
  pedalPointTensionFm,
  pedalTensionDepthValue,
} from './harmonic-pedal-point-tension';

describe('pedalPointTensionFm', () => {
  it('unison pedal is neutral', () => {
    const fm = pedalPointTensionFm(0, 0, 'ambient', 'intro');
    expect(fm).toBe(1.0);
  });

  it('tritone creates maximum tension', () => {
    const fm = pedalPointTensionFm(0, 6, 'ambient', 'intro');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('perfect 5th is low tension', () => {
    const fifth = pedalPointTensionFm(0, 7, 'ambient', 'intro');
    const tritone = pedalPointTensionFm(0, 6, 'ambient', 'intro');
    expect(tritone).toBeGreaterThan(fifth);
  });

  it('minor 2nd is high tension', () => {
    const m2 = pedalPointTensionFm(0, 1, 'ambient', 'intro');
    const M3 = pedalPointTensionFm(0, 4, 'ambient', 'intro');
    expect(m2).toBeGreaterThan(M3);
  });

  it('ambient tenses more than syro', () => {
    const amb = pedalPointTensionFm(0, 6, 'ambient', 'intro');
    const sy = pedalPointTensionFm(0, 6, 'syro', 'intro');
    expect(amb).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let p = 0; p < 12; p++) {
      for (let c = 0; c < 12; c++) {
        const fm = pedalPointTensionFm(p, c, 'ambient', 'breakdown');
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.05);
      }
    }
  });
});

describe('pedalTensionDepthValue', () => {
  it('ambient is highest', () => {
    expect(pedalTensionDepthValue('ambient')).toBe(0.50);
  });

  it('blockhead is lowest', () => {
    expect(pedalTensionDepthValue('blockhead')).toBe(0.15);
  });
});
