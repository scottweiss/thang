import { describe, it, expect } from 'vitest';
import {
  archScore,
  archGainMultiplier,
  archPreference,
} from './contour-arc-scoring';

describe('archScore', () => {
  it('perfect arch scores high', () => {
    const score = archScore([60, 62, 64, 67, 69, 67, 64, 62, 60]);
    expect(score).toBeGreaterThan(0.5);
  });

  it('flat line scores lower', () => {
    const arch = archScore([60, 62, 64, 67, 64, 62, 60]);
    const flat = archScore([60, 60, 60, 60, 60, 60, 60]);
    expect(arch).toBeGreaterThan(flat);
  });

  it('short phrase returns 0.5', () => {
    expect(archScore([60, 64])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = archScore([72, 60, 48, 84, 36]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('ascending only scores moderate', () => {
    const ascending = archScore([60, 62, 64, 67, 69]);
    const arch = archScore([60, 64, 69, 67, 62]);
    // Arch should score higher than pure ascent (which has no descent)
    expect(arch).toBeGreaterThanOrEqual(ascending * 0.8);
  });
});

describe('archGainMultiplier', () => {
  it('stays in 0.93-1.07 range', () => {
    const mul = archGainMultiplier([60, 64, 67, 64, 60], 'avril');
    expect(mul).toBeGreaterThanOrEqual(0.93);
    expect(mul).toBeLessThanOrEqual(1.07);
  });

  it('arch-loving mood responds more', () => {
    const pitches = [60, 64, 67, 72, 67, 64, 60]; // arch
    const avril = archGainMultiplier(pitches, 'avril');
    const syro = archGainMultiplier(pitches, 'syro');
    expect(Math.abs(avril - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('archPreference', () => {
  it('avril is highest', () => {
    expect(archPreference('avril')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(archPreference('syro')).toBe(0.15);
  });
});
