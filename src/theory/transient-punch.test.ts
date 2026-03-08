import { describe, it, expect } from 'vitest';
import {
  punchLpfMultiplier,
  punchGainMultiplier,
  detectAttacks,
  shouldApplyPunch,
  punchIntensity,
} from './transient-punch';

describe('punchLpfMultiplier', () => {
  it('1.0 when not attack', () => {
    expect(punchLpfMultiplier('trance', 'peak', false)).toBe(1.0);
  });

  it('> 1.0 on attack during build', () => {
    expect(punchLpfMultiplier('trance', 'build', true)).toBeGreaterThan(1.0);
  });

  it('peaks are punchier than breakdowns', () => {
    const peak = punchLpfMultiplier('blockhead', 'peak', true);
    const bd = punchLpfMultiplier('blockhead', 'breakdown', true);
    expect(peak).toBeGreaterThan(bd);
  });

  it('capped at 1.3', () => {
    expect(punchLpfMultiplier('blockhead', 'peak', true)).toBeLessThanOrEqual(1.3);
  });
});

describe('punchGainMultiplier', () => {
  it('1.0 when not attack', () => {
    expect(punchGainMultiplier('trance', 'peak', false)).toBe(1.0);
  });

  it('> 1.0 on attack', () => {
    expect(punchGainMultiplier('blockhead', 'peak', true)).toBeGreaterThan(1.0);
  });

  it('capped at 1.15', () => {
    expect(punchGainMultiplier('blockhead', 'peak', true)).toBeLessThanOrEqual(1.15);
  });
});

describe('detectAttacks', () => {
  it('first note is always attack', () => {
    expect(detectAttacks(['C4', 'D4', 'E4'])).toEqual([true, false, false]);
  });

  it('notes after rests are attacks', () => {
    expect(detectAttacks(['C4', '~', 'E4', 'F4'])).toEqual([true, false, true, false]);
  });

  it('rests are never attacks', () => {
    expect(detectAttacks(['~', '~', 'C4'])).toEqual([false, false, true]);
  });

  it('all rests = no attacks', () => {
    expect(detectAttacks(['~', '~'])).toEqual([false, false]);
  });
});

describe('shouldApplyPunch', () => {
  it('true for punchy moods at peak', () => {
    expect(shouldApplyPunch('blockhead', 'peak')).toBe(true);
  });

  it('false for ambient at breakdown', () => {
    expect(shouldApplyPunch('ambient', 'breakdown')).toBe(false);
  });
});

describe('punchIntensity', () => {
  it('blockhead is strongest', () => {
    expect(punchIntensity('blockhead')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(punchIntensity('ambient')).toBe(0.08);
  });
});
