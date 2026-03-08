import { describe, it, expect } from 'vitest';
import {
  tessituraGainCorrection,
  correctionStrength,
} from './tessitura-tracking';

describe('tessituraGainCorrection', () => {
  it('ideal register returns near 1.0', () => {
    const gain = tessituraGainCorrection(67, 'melody', 'avril'); // G4 = ideal
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('extreme register gets reduction', () => {
    const ideal = tessituraGainCorrection(67, 'melody', 'avril');
    const extreme = tessituraGainCorrection(90, 'melody', 'avril');
    expect(extreme).toBeLessThan(ideal);
  });

  it('stays in 0.85-1.10 range', () => {
    for (let midi = 30; midi <= 96; midi += 6) {
      const gain = tessituraGainCorrection(midi, 'melody', 'xtal');
      expect(gain).toBeGreaterThanOrEqual(0.85);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });

  it('drone has lower ideal center', () => {
    const droneLow = tessituraGainCorrection(40, 'drone', 'trance'); // ideal
    const droneHigh = tessituraGainCorrection(70, 'drone', 'trance'); // too high
    expect(droneLow).toBeGreaterThan(droneHigh);
  });

  it('weak mood applies less correction', () => {
    const strong = tessituraGainCorrection(90, 'melody', 'avril');
    const weak = tessituraGainCorrection(90, 'melody', 'syro');
    expect(Math.abs(strong - 1.0)).toBeGreaterThan(Math.abs(weak - 1.0));
  });
});

describe('correctionStrength', () => {
  it('avril is high', () => {
    expect(correctionStrength('avril')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(correctionStrength('syro')).toBe(0.30);
  });
});
