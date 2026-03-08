import { describe, it, expect } from 'vitest';
import {
  gravitationNudge,
  gravitationStrength,
  shouldApplyGravitation,
} from './rhythmic-gravitation';

describe('gravitationNudge', () => {
  it('no nudge on beat 1 (position 0)', () => {
    expect(gravitationNudge(0, 'trance', 'peak')).toBe(0);
  });

  it('no nudge on beat 3 (position 8)', () => {
    expect(gravitationNudge(8, 'trance', 'peak')).toBe(0);
  });

  it('nudge on weak 16th (position 1)', () => {
    const nudge = gravitationNudge(1, 'trance', 'peak');
    expect(nudge).not.toBe(0);
  });

  it('trance nudge > ambient nudge', () => {
    const trance = Math.abs(gravitationNudge(1, 'trance', 'peak'));
    const ambient = Math.abs(gravitationNudge(1, 'ambient', 'peak'));
    expect(trance).toBeGreaterThan(ambient);
  });

  it('stays within ±0.02s', () => {
    for (let pos = 0; pos < 16; pos++) {
      const nudge = gravitationNudge(pos, 'trance', 'peak');
      expect(Math.abs(nudge)).toBeLessThanOrEqual(0.02);
    }
  });

  it('peak tighter than breakdown', () => {
    const peak = Math.abs(gravitationNudge(1, 'disco', 'peak'));
    const bd = Math.abs(gravitationNudge(1, 'disco', 'breakdown'));
    expect(peak).toBeGreaterThan(bd);
  });
});

describe('gravitationStrength', () => {
  it('trance is strongest', () => {
    expect(gravitationStrength('trance')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(gravitationStrength('ambient')).toBe(0.10);
  });
});

describe('shouldApplyGravitation', () => {
  it('true for trance peak', () => {
    expect(shouldApplyGravitation('trance', 'peak')).toBe(true);
  });

  it('true for ambient groove', () => {
    expect(shouldApplyGravitation('ambient', 'groove')).toBe(true);
  });
});
