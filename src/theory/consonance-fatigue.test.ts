import { describe, it, expect } from 'vitest';
import {
  chordConsonance,
  updateFatigue,
  shouldInjectColor,
  extensionBias,
  resolutionBonus,
  fatigueRate,
} from './consonance-fatigue';

describe('chordConsonance', () => {
  it('unison is maximally consonant', () => {
    expect(chordConsonance([0])).toBe(1.0);
  });

  it('perfect fifth is highly consonant', () => {
    const c = chordConsonance([0, 7]);
    expect(c).toBeGreaterThan(0.75);
  });

  it('major triad is consonant', () => {
    const c = chordConsonance([0, 4, 7]);
    expect(c).toBeGreaterThan(0.7);
  });

  it('minor second cluster is dissonant', () => {
    const c = chordConsonance([0, 1, 2]);
    expect(c).toBeLessThan(0.3);
  });

  it('tritone is dissonant', () => {
    const c = chordConsonance([0, 6]);
    expect(c).toBeLessThan(0.25);
  });

  it('empty returns 1.0', () => {
    expect(chordConsonance([])).toBe(1.0);
  });
});

describe('updateFatigue', () => {
  it('consonance increases fatigue', () => {
    const updated = updateFatigue(0.0, 0.9, 'lofi', 'groove');
    expect(updated).toBeGreaterThan(0.0);
  });

  it('dissonance decreases fatigue', () => {
    const updated = updateFatigue(0.5, 0.2, 'lofi', 'breakdown');
    expect(updated).toBeLessThan(0.5);
  });

  it('clamps to 0-1', () => {
    const low = updateFatigue(0.0, 0.1, 'trance', 'breakdown');
    expect(low).toBeGreaterThanOrEqual(0);
    const high = updateFatigue(1.0, 1.0, 'syro', 'peak');
    expect(high).toBeLessThanOrEqual(1);
  });

  it('syro accumulates faster than trance', () => {
    const syro = updateFatigue(0.0, 0.9, 'syro', 'groove');
    const trance = updateFatigue(0.0, 0.9, 'trance', 'groove');
    expect(syro).toBeGreaterThan(trance);
  });

  it('breakdown recovers faster than peak', () => {
    const breakdown = updateFatigue(0.5, 0.3, 'lofi', 'breakdown');
    const peak = updateFatigue(0.5, 0.3, 'lofi', 'peak');
    expect(breakdown).toBeLessThan(peak);
  });
});

describe('shouldInjectColor', () => {
  it('low fatigue does not inject', () => {
    expect(shouldInjectColor(0.1, 'trance')).toBe(false);
  });

  it('high fatigue injects for syro', () => {
    expect(shouldInjectColor(0.5, 'syro')).toBe(true);
  });

  it('syro injects at lower fatigue than trance', () => {
    // syro threshold = 1 - 0.35*2 = 0.30
    // trance threshold = 1 - 0.08*2 = 0.84
    expect(shouldInjectColor(0.35, 'syro')).toBe(true);
    expect(shouldInjectColor(0.35, 'trance')).toBe(false);
  });
});

describe('extensionBias', () => {
  it('zero fatigue returns 0', () => {
    expect(extensionBias(0)).toBe(0);
  });

  it('high fatigue approaches 1', () => {
    expect(extensionBias(1.0)).toBeCloseTo(1.0, 1);
  });

  it('moderate fatigue gives moderate bias', () => {
    const bias = extensionBias(0.5);
    expect(bias).toBeGreaterThan(0.1);
    expect(bias).toBeLessThan(0.5);
  });
});

describe('resolutionBonus', () => {
  it('no bonus when consonance is low', () => {
    expect(resolutionBonus(0.8, 0.3)).toBe(0);
  });

  it('bonus when high fatigue meets high consonance', () => {
    const bonus = resolutionBonus(0.8, 0.9);
    expect(bonus).toBeGreaterThan(0.2);
  });

  it('caps at 0.5', () => {
    expect(resolutionBonus(1.0, 1.0)).toBeLessThanOrEqual(0.5);
  });

  it('low fatigue gives no bonus even with consonance', () => {
    expect(resolutionBonus(0.1, 0.9)).toBeLessThan(0.1);
  });
});

describe('fatigueRate', () => {
  it('syro is highest', () => {
    expect(fatigueRate('syro')).toBe(0.35);
  });

  it('trance is lowest', () => {
    expect(fatigueRate('trance')).toBe(0.08);
  });
});
