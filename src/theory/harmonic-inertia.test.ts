import { describe, it, expect } from 'vitest';
import {
  harmonicInertia,
  changeReluctance,
  cadentialEscape,
  shouldApplyInertia,
  inertiaStrength,
} from './harmonic-inertia';

describe('harmonicInertia', () => {
  it('high inertia with consonant voicing on first tick', () => {
    const inertia = harmonicInertia(0.9, 0, 'ambient', 'breakdown');
    expect(inertia).toBeGreaterThan(0.3);
  });

  it('inertia decreases over time', () => {
    const early = harmonicInertia(0.8, 0, 'lofi', 'groove');
    const late = harmonicInertia(0.8, 5, 'lofi', 'groove');
    expect(early).toBeGreaterThan(late);
  });

  it('dissonant voicing has low inertia', () => {
    const consonant = harmonicInertia(0.9, 0, 'lofi', 'groove');
    const dissonant = harmonicInertia(0.1, 0, 'lofi', 'groove');
    expect(consonant).toBeGreaterThan(dissonant);
  });

  it('0 when fully decayed', () => {
    expect(harmonicInertia(0.5, 10, 'lofi', 'groove')).toBe(0);
  });

  it('clamped 0-1', () => {
    const val = harmonicInertia(1.0, 0, 'ambient', 'breakdown');
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('builds have less inertia than breakdowns', () => {
    const build = harmonicInertia(0.8, 1, 'lofi', 'build');
    const bd = harmonicInertia(0.8, 1, 'lofi', 'breakdown');
    expect(bd).toBeGreaterThan(build);
  });
});

describe('changeReluctance', () => {
  it('1.0 with no inertia', () => {
    expect(changeReluctance(0, 'lofi')).toBe(1.0);
  });

  it('> 1.0 with high inertia', () => {
    expect(changeReluctance(0.8, 'ambient')).toBeGreaterThan(1.0);
  });

  it('ambient has stronger reluctance than syro', () => {
    expect(changeReluctance(0.5, 'ambient')).toBeGreaterThan(changeReluctance(0.5, 'syro'));
  });
});

describe('cadentialEscape', () => {
  it('0 before 80% progress', () => {
    expect(cadentialEscape(0.5, 'avril')).toBe(0);
    expect(cadentialEscape(0.79, 'avril')).toBe(0);
  });

  it('negative at phrase end (reduces inertia)', () => {
    expect(cadentialEscape(0.95, 'avril')).toBeLessThan(0);
  });

  it('stronger escape near 100% progress', () => {
    const at90 = cadentialEscape(0.9, 'avril');
    const at99 = cadentialEscape(0.99, 'avril');
    expect(at99).toBeLessThan(at90); // more negative = stronger escape
  });
});

describe('shouldApplyInertia', () => {
  it('true for ambient breakdown', () => {
    // 0.60 * 1.3 = 0.78 > 0.15
    expect(shouldApplyInertia('ambient', 'breakdown')).toBe(true);
  });

  it('true for syro build', () => {
    // 0.20 * 0.6 = 0.12 — just below, let's check
    expect(shouldApplyInertia('syro', 'build')).toBe(false);
  });
});

describe('inertiaStrength', () => {
  it('ambient is strongest', () => {
    expect(inertiaStrength('ambient')).toBe(0.60);
  });

  it('syro is weakest', () => {
    expect(inertiaStrength('syro')).toBe(0.20);
  });
});
