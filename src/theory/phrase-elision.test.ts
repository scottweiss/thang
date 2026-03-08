import { describe, it, expect } from 'vitest';
import {
  shouldElide,
  elisionType,
  elisionOverlap,
  adjustBreathForElision,
  elisionTendency,
} from './phrase-elision';

describe('shouldElide', () => {
  it('ambient elides more often than trance', () => {
    const ambientCount = Array.from({ length: 20 }, (_, i) =>
      shouldElide(i, 'ambient', 'groove') ? 1 as number : 0 as number
    ).reduce((a, b) => a + b, 0);
    const tranceCount = Array.from({ length: 20 }, (_, i) =>
      shouldElide(i, 'trance', 'groove') ? 1 as number : 0 as number
    ).reduce((a, b) => a + b, 0);
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });

  it('breakdown increases elision tendency', () => {
    const grooveCount = Array.from({ length: 20 }, (_, i) =>
      shouldElide(i, 'lofi', 'groove') ? 1 as number : 0 as number
    ).reduce((a, b) => a + b, 0);
    const breakdownCount = Array.from({ length: 20 }, (_, i) =>
      shouldElide(i, 'lofi', 'breakdown') ? 1 as number : 0 as number
    ).reduce((a, b) => a + b, 0);
    expect(breakdownCount).toBeGreaterThanOrEqual(grooveCount);
  });

  it('is deterministic for same inputs', () => {
    const a = shouldElide(5, 'lofi', 'groove');
    const b = shouldElide(5, 'lofi', 'groove');
    expect(a).toBe(b);
  });

  it('returns boolean', () => {
    expect(typeof shouldElide(0, 'ambient', 'groove')).toBe('boolean');
  });
});

describe('elisionType', () => {
  it('high tension returns anticipation', () => {
    expect(elisionType(0, 'lofi', 0.9)).toBe('anticipation');
  });

  it('low tension returns sustain', () => {
    expect(elisionType(0, 'lofi', 0.1)).toBe('sustain');
  });

  it('moderate tension alternates dovetail/sustain', () => {
    const even = elisionType(0, 'lofi', 0.5);
    const odd = elisionType(1, 'lofi', 0.5);
    expect(even).toBe('dovetail');
    expect(odd).toBe('sustain');
  });
});

describe('elisionOverlap', () => {
  it('ambient has larger overlap than trance', () => {
    expect(elisionOverlap('ambient', 'groove')).toBeGreaterThan(
      elisionOverlap('trance', 'groove')
    );
  });

  it('breakdown adds extra overlap', () => {
    expect(elisionOverlap('lofi', 'breakdown')).toBeGreaterThan(
      elisionOverlap('lofi', 'groove')
    );
  });
});

describe('adjustBreathForElision', () => {
  it('preserves breath when no elision', () => {
    // Use trance + intro (low tendency) and a phrase index that won't elide
    // trance tendency = 0.15, intro mult = 0.8, effective = 0.12
    // Find a phrase index where hash >= 0.12
    // hash = ((i+1) * 0.618...) % 1
    // i=0: hash = 0.618 >= 0.12 → elides. Try with a mood that almost never elides
    // Actually let's just verify the logic: if shouldElide returns false, breath is unchanged
    const breath = adjustBreathForElision(3, 0, 'trance', 'intro');
    // trance + intro: tendency = 0.15 * 0.8 = 0.12, hash for 0 = 0.618 > 0.12 → no elision
    expect(breath).toBe(3);
  });

  it('reduces breath when elision applies', () => {
    // ambient + breakdown: tendency = 0.70 * 1.5 = 1.05, always elides
    const breath = adjustBreathForElision(3, 0, 'ambient', 'breakdown');
    expect(breath).toBeLessThan(3);
  });

  it('never goes below 0', () => {
    const breath = adjustBreathForElision(0, 0, 'ambient', 'breakdown');
    expect(breath).toBe(0);
  });
});

describe('elisionTendency', () => {
  it('ambient has highest tendency', () => {
    expect(elisionTendency('ambient')).toBe(0.70);
  });

  it('trance has lowest tendency', () => {
    expect(elisionTendency('trance')).toBe(0.15);
  });

  it('all moods return values between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    moods.forEach(m => {
      expect(elisionTendency(m)).toBeGreaterThanOrEqual(0);
      expect(elisionTendency(m)).toBeLessThanOrEqual(1);
    });
  });
});
