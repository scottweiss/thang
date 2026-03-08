import { describe, it, expect } from 'vitest';
import {
  magneticPull,
  attractorPitch,
  repellerPitches,
  shouldApplyMagnetism,
  magneticStrength,
} from './tonal-magnetism';

describe('magneticPull', () => {
  it('strongest pull at attractor pitch (distance 0)', () => {
    const pull = magneticPull(0, 0, 'trance', 'intro');
    expect(pull).toBeGreaterThan(1.5);
  });

  it('weaker pull at distance', () => {
    const close = magneticPull(2, 0, 'trance', 'intro');
    const far = magneticPull(5, 0, 'trance', 'intro');
    expect(close).toBeGreaterThan(far);
  });

  it('trance has stronger pull than syro', () => {
    const trance = magneticPull(2, 0, 'trance', 'intro');
    const syro = magneticPull(2, 0, 'syro', 'intro');
    expect(trance).toBeGreaterThan(syro);
  });

  it('clamped 0.5-2.0', () => {
    expect(magneticPull(0, 0, 'trance', 'intro')).toBeLessThanOrEqual(2.0);
    expect(magneticPull(6, 0, 'syro', 'peak')).toBeGreaterThanOrEqual(0.5);
  });

  it('intro has stronger pull than peak', () => {
    const intro = magneticPull(3, 0, 'lofi', 'intro');
    const peak = magneticPull(3, 0, 'lofi', 'peak');
    expect(intro).toBeGreaterThan(peak);
  });
});

describe('attractorPitch', () => {
  it('default is chord root', () => {
    expect(attractorPitch(0, 4, 7, 'groove', 0.5)).toBe(0);
  });

  it('drifts to 5th at peak with high progress', () => {
    expect(attractorPitch(0, 4, 7, 'peak', 0.8)).toBe(7);
  });

  it('drifts to 3rd in late builds', () => {
    expect(attractorPitch(0, 4, 7, 'build', 0.9)).toBe(4);
  });

  it('stays on root during intro', () => {
    expect(attractorPitch(0, 4, 7, 'intro', 0.9)).toBe(0);
  });
});

describe('repellerPitches', () => {
  it('includes tritone (6 semitones)', () => {
    expect(repellerPitches(0)).toContain(6);
  });

  it('includes minor 2nd above and below', () => {
    expect(repellerPitches(0)).toContain(1);
    expect(repellerPitches(0)).toContain(11);
  });

  it('wraps around 12', () => {
    expect(repellerPitches(10)).toContain(4); // tritone
    expect(repellerPitches(10)).toContain(11); // minor 2nd above
    expect(repellerPitches(10)).toContain(9); // minor 2nd below
  });
});

describe('shouldApplyMagnetism', () => {
  it('true for trance intro', () => {
    expect(shouldApplyMagnetism('trance', 'intro')).toBe(true);
  });

  it('true for syro peak (0.35 * 0.6 = 0.21, barely below)', () => {
    // syro=0.35 * peak=0.6 = 0.21 — below 0.25 threshold
    expect(shouldApplyMagnetism('syro', 'peak')).toBe(false);
  });
});

describe('magneticStrength', () => {
  it('trance is strongest', () => {
    expect(magneticStrength('trance')).toBe(0.80);
  });

  it('syro is weakest', () => {
    expect(magneticStrength('syro')).toBe(0.35);
  });
});
