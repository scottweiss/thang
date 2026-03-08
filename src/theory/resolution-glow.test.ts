import { describe, it, expect } from 'vitest';
import {
  detectResolution,
  resolutionGlowMultiplier,
  resolutionGainBoost,
  glowIntensity,
} from './resolution-glow';

describe('detectResolution', () => {
  it('V7 → I is perfect', () => {
    expect(detectResolution(4, 'dom7', 0)).toBe('perfect');
  });

  it('V → I (no 7th) is strong', () => {
    expect(detectResolution(4, 'maj', 0)).toBe('strong');
  });

  it('IV → I is mild (plagal)', () => {
    expect(detectResolution(3, 'maj', 0)).toBe('mild');
  });

  it('vii° → I is strong', () => {
    expect(detectResolution(6, 'dim', 0)).toBe('strong');
  });

  it('V → vi is mild (deceptive)', () => {
    expect(detectResolution(4, 'dom7', 5)).toBe('mild');
  });

  it('ii → V is mild (half cadence prep)', () => {
    expect(detectResolution(1, 'min7', 4)).toBe('mild');
  });

  it('I → IV is none (no resolution)', () => {
    expect(detectResolution(0, 'maj', 3)).toBe('none');
  });

  it('ii → iii is none', () => {
    expect(detectResolution(1, 'min', 2)).toBe('none');
  });
});

describe('resolutionGlowMultiplier', () => {
  it('no glow for non-resolution', () => {
    expect(resolutionGlowMultiplier('none', 'lofi', 0)).toBe(1.0);
  });

  it('perfect resolution has highest glow at tick 0', () => {
    const perfect = resolutionGlowMultiplier('perfect', 'lofi', 0);
    const mild = resolutionGlowMultiplier('mild', 'lofi', 0);
    expect(perfect).toBeGreaterThan(mild);
    expect(perfect).toBeGreaterThan(1.0);
  });

  it('glow decays over ticks', () => {
    const tick0 = resolutionGlowMultiplier('perfect', 'lofi', 0);
    const tick1 = resolutionGlowMultiplier('perfect', 'lofi', 1);
    const tick3 = resolutionGlowMultiplier('perfect', 'lofi', 3);
    expect(tick0).toBeGreaterThan(tick1);
    expect(tick1).toBeGreaterThan(tick3);
    expect(tick3).toBeCloseTo(1.0, 1); // nearly gone by tick 3
  });

  it('avril has highest intensity', () => {
    const avril = resolutionGlowMultiplier('perfect', 'avril', 0);
    const ambient = resolutionGlowMultiplier('perfect', 'ambient', 0);
    expect(avril).toBeGreaterThan(ambient);
  });
});

describe('resolutionGainBoost', () => {
  it('no boost for non-resolution', () => {
    expect(resolutionGainBoost('none', 'lofi', 0)).toBe(1.0);
  });

  it('boost is smaller than glow', () => {
    const glow = resolutionGlowMultiplier('perfect', 'lofi', 0);
    const gain = resolutionGainBoost('perfect', 'lofi', 0);
    // Both > 1.0 but gain increase should be smaller
    expect(glow - 1.0).toBeGreaterThan(gain - 1.0);
  });

  it('decays faster than glow', () => {
    const glowTick2 = resolutionGlowMultiplier('perfect', 'lofi', 2);
    const gainTick2 = resolutionGainBoost('perfect', 'lofi', 2);
    // Gain should be closer to 1.0 than glow at same tick
    expect(Math.abs(gainTick2 - 1.0)).toBeLessThan(Math.abs(glowTick2 - 1.0));
  });
});

describe('glowIntensity', () => {
  it('avril is highest', () => {
    expect(glowIntensity('avril')).toBe(0.22);
  });

  it('ambient is lowest', () => {
    expect(glowIntensity('ambient')).toBe(0.08);
  });
});
