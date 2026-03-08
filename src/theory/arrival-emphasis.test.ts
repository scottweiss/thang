import { describe, it, expect } from 'vitest';
import { isCadentialArrival, arrivalEmphasis } from './arrival-emphasis';

describe('isCadentialArrival', () => {
  it('V7 → I is an arrival', () => {
    expect(isCadentialArrival(0, 4, 'dom7')).toBe(true);
  });

  it('V → I is an arrival', () => {
    expect(isCadentialArrival(0, 4, 'maj')).toBe(true);
  });

  it('vii° → I is an arrival', () => {
    expect(isCadentialArrival(0, 6, 'dim')).toBe(true);
  });

  it('IV → I is an arrival (plagal)', () => {
    expect(isCadentialArrival(0, 3, 'maj')).toBe(true);
  });

  it('ii → I is not an arrival (pull too low)', () => {
    expect(isCadentialArrival(0, 1, 'min')).toBe(false);
  });

  it('V → IV is not an arrival (not tonic)', () => {
    expect(isCadentialArrival(3, 4, 'dom7')).toBe(false);
  });

  it('I → I is not an arrival (no pull from tonic)', () => {
    expect(isCadentialArrival(0, 0, 'maj')).toBe(false);
  });

  it('vi → I is not an arrival (low pull)', () => {
    expect(isCadentialArrival(0, 5, 'min')).toBe(false);
  });
});

describe('arrivalEmphasis', () => {
  it('V7 → I at tick 0 gives maximum emphasis', () => {
    const e = arrivalEmphasis(0, 4, 'dom7', 0, 'avril');
    expect(e.gainBoost).toBeGreaterThan(0.1);
    expect(e.brightnessBoost).toBeGreaterThan(0.1);
  });

  it('emphasis decays over ticks', () => {
    const t0 = arrivalEmphasis(0, 4, 'dom7', 0, 'avril');
    const t1 = arrivalEmphasis(0, 4, 'dom7', 1, 'avril');
    const t2 = arrivalEmphasis(0, 4, 'dom7', 2, 'avril');
    expect(t0.gainBoost).toBeGreaterThan(t1.gainBoost);
    expect(t1.gainBoost).toBeGreaterThan(t2.gainBoost);
  });

  it('emphasis is zero after tick 3', () => {
    const e = arrivalEmphasis(0, 4, 'dom7', 4, 'avril');
    expect(e.gainBoost).toBe(0);
    expect(e.brightnessBoost).toBe(0);
  });

  it('non-arrival gives zero emphasis', () => {
    const e = arrivalEmphasis(3, 4, 'dom7', 0, 'avril');
    expect(e.gainBoost).toBe(0);
    expect(e.brightnessBoost).toBe(0);
  });

  it('V7→I is stronger than IV→I', () => {
    const authentic = arrivalEmphasis(0, 4, 'dom7', 0, 'ambient');
    const plagal = arrivalEmphasis(0, 3, 'maj', 0, 'ambient');
    expect(authentic.gainBoost).toBeGreaterThan(plagal.gainBoost);
  });

  it('avril has stronger emphasis than trance', () => {
    const avril = arrivalEmphasis(0, 4, 'dom7', 0, 'avril');
    const trance = arrivalEmphasis(0, 4, 'dom7', 0, 'trance');
    expect(avril.gainBoost).toBeGreaterThan(trance.gainBoost);
  });

  it('all values are non-negative', () => {
    const e = arrivalEmphasis(0, 4, 'dom7', 0, 'syro');
    expect(e.gainBoost).toBeGreaterThanOrEqual(0);
    expect(e.brightnessBoost).toBeGreaterThanOrEqual(0);
  });

  it('gainBoost is capped below 0.2', () => {
    // Even the strongest cadence (V7→I in avril, tick 0) should not exceed 0.2
    const e = arrivalEmphasis(0, 4, 'dom7', 0, 'avril');
    expect(e.gainBoost).toBeLessThan(0.2);
  });

  it('brightnessBoost is capped below 0.25', () => {
    const e = arrivalEmphasis(0, 4, 'dom7', 0, 'avril');
    expect(e.brightnessBoost).toBeLessThan(0.25);
  });
});
