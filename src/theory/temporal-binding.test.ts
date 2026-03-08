import { describe, it, expect } from 'vitest';
import {
  bindingWindow,
  grooveTightness,
  timingCorrection,
  shouldApplyBinding,
  baseBindingWindow,
} from './temporal-binding';

describe('bindingWindow', () => {
  it('trance is tightest', () => {
    expect(bindingWindow('trance', 'groove')).toBe(15);
  });

  it('peaks tighten the window', () => {
    const groove = bindingWindow('lofi', 'groove');
    const peak = bindingWindow('lofi', 'peak');
    expect(peak).toBeLessThan(groove);
  });

  it('breakdowns widen the window', () => {
    const groove = bindingWindow('lofi', 'groove');
    const bd = bindingWindow('lofi', 'breakdown');
    expect(bd).toBeGreaterThan(groove);
  });
});

describe('grooveTightness', () => {
  it('1.0 for single layer', () => {
    expect(grooveTightness([5], 'trance', 'peak')).toBe(1.0);
  });

  it('1.0 when all onsets within window', () => {
    expect(grooveTightness([0, 5, 10], 'lofi', 'groove')).toBe(1.0);
  });

  it('< 1.0 when spread exceeds window', () => {
    // lofi groove window = 50ms, spread = 80ms
    expect(grooveTightness([0, 80], 'lofi', 'groove')).toBeLessThan(1.0);
  });

  it('tighter groove with trance than lofi at same spread', () => {
    // Same spread, but trance has tighter window — will rate lower
    const trance = grooveTightness([0, 30], 'trance', 'groove');
    const lofi = grooveTightness([0, 30], 'lofi', 'groove');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('clamped at 0', () => {
    expect(grooveTightness([0, 500], 'trance', 'peak')).toBeGreaterThanOrEqual(0);
  });
});

describe('timingCorrection', () => {
  it('0 when within binding window', () => {
    // lofi groove window = 50ms, offset = 20ms — within window
    expect(timingCorrection(20, 0, 'lofi', 'groove')).toBe(0);
  });

  it('non-zero when outside window', () => {
    // trance groove window = 15ms, offset = 30ms — outside
    expect(timingCorrection(30, 0, 'trance', 'groove')).not.toBe(0);
  });

  it('pulls toward target', () => {
    // Layer is 50ms late, target is 0ms, trance window is 15ms
    const correction = timingCorrection(50, 0, 'trance', 'groove');
    expect(correction).toBeLessThan(0); // should advance (negative correction)
  });
});

describe('shouldApplyBinding', () => {
  it('true for all standard combos (all windows < 80ms)', () => {
    expect(shouldApplyBinding('trance', 'peak')).toBe(true);
    expect(shouldApplyBinding('lofi', 'groove')).toBe(true);
  });
});

describe('baseBindingWindow', () => {
  it('trance is tightest', () => {
    expect(baseBindingWindow('trance')).toBe(15);
  });

  it('ambient is widest', () => {
    expect(baseBindingWindow('ambient')).toBe(55);
  });
});
