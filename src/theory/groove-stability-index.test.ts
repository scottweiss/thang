import { describe, it, expect } from 'vitest';
import {
  grooveStabilityGain,
  stabilityPreference,
} from './groove-stability-index';

describe('grooveStabilityGain', () => {
  it('high consistency in trance gets boost', () => {
    const gain = grooveStabilityGain(0.9, 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('low consistency in trance gets reduction', () => {
    const gain = grooveStabilityGain(0.1, 'trance');
    expect(gain).toBeLessThan(1.0);
  });

  it('syro barely cares about stability', () => {
    const trance = grooveStabilityGain(0.9, 'trance');
    const syro = grooveStabilityGain(0.9, 'syro');
    expect(trance).toBeGreaterThan(syro);
  });

  it('stays in 0.94-1.06 range', () => {
    for (let c = 0; c <= 1.0; c += 0.2) {
      const gain = grooveStabilityGain(c, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('stabilityPreference', () => {
  it('trance is highest', () => {
    expect(stabilityPreference('trance')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(stabilityPreference('ambient')).toBe(0.10);
  });
});
