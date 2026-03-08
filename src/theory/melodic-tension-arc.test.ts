import { describe, it, expect } from 'vitest';
import {
  tensionArcGain,
  arcSensitivity,
} from './melodic-tension-arc';

describe('tensionArcGain', () => {
  it('tritone is tense (gets emphasis)', () => {
    const gain = tensionArcGain(6, 0, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('unison is stable (near neutral)', () => {
    const gain = tensionArcGain(0, 0, 'avril');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('avril is more sensitive than syro', () => {
    const avril = tensionArcGain(6, 0, 'avril');
    const syro = tensionArcGain(6, 0, 'syro');
    expect(avril).toBeGreaterThan(syro);
  });

  it('stays in 0.94-1.08 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const gain = tensionArcGain(pc, 0, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('arcSensitivity', () => {
  it('avril is highest', () => {
    expect(arcSensitivity('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(arcSensitivity('syro')).toBe(0.25);
  });
});
