import { describe, it, expect } from 'vitest';
import {
  tessituraComfort,
  tessituraComfortGain,
  comfortStrengthValue,
} from './melodic-tessitura-comfort';

describe('tessituraComfort', () => {
  it('at center = 1.0', () => {
    expect(tessituraComfort(64, 'avril')).toBe(1.0); // avril center is 64
  });

  it('far from center = 0', () => {
    expect(tessituraComfort(40, 'avril')).toBe(0);
  });

  it('closer to center = higher comfort', () => {
    expect(tessituraComfort(63, 'avril')).toBeGreaterThan(tessituraComfort(60, 'avril'));
  });

  it('symmetric around center', () => {
    // avril center = 64, width = 12
    const above = tessituraComfort(68, 'avril');
    const below = tessituraComfort(60, 'avril');
    expect(above).toBeCloseTo(below, 5);
  });
});

describe('tessituraComfortGain', () => {
  it('center pitch gets boost', () => {
    const gain = tessituraComfortGain(64, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('extreme pitch is neutral', () => {
    const gain = tessituraComfortGain(40, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than syro', () => {
    const av = tessituraComfortGain(64, 'avril', 'peak');
    const sy = tessituraComfortGain(67, 'syro', 'peak'); // syro center is 67
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 36; p <= 84; p++) {
      const gain = tessituraComfortGain(p, 'avril', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('comfortStrengthValue', () => {
  it('avril is highest', () => {
    expect(comfortStrengthValue('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(comfortStrengthValue('syro')).toBe(0.25);
  });
});
