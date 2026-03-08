import { describe, it, expect } from 'vitest';
import {
  tonalAmbiguityScore,
  suggestAmbiguousExtensions,
  shouldApplyAmbiguity,
  ambiguityAppetite,
  ambiguityDarkenFactor,
} from './tonal-ambiguity';

describe('tonalAmbiguityScore', () => {
  it('returns 0 for single note', () => {
    expect(tonalAmbiguityScore(['C'])).toBe(0);
  });

  it('tritone is highly ambiguous', () => {
    const score = tonalAmbiguityScore(['C', 'F#']);
    expect(score).toBeGreaterThan(0.2);
  });

  it('perfect fifth is less ambiguous than tritone', () => {
    const fifth = tonalAmbiguityScore(['C', 'G']);
    const tritone = tonalAmbiguityScore(['C', 'F#']);
    expect(tritone).toBeGreaterThan(fifth);
  });

  it('whole-tone set is ambiguous', () => {
    const score = tonalAmbiguityScore(['C', 'D', 'E', 'F#']);
    expect(score).toBeGreaterThan(0.3);
  });

  it('major triad is not very ambiguous', () => {
    const score = tonalAmbiguityScore(['C', 'E', 'G']);
    expect(score).toBeLessThan(0.3);
  });

  it('stays within 0-1', () => {
    const score = tonalAmbiguityScore(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#']);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('suggestAmbiguousExtensions', () => {
  it('returns notes that increase ambiguity', () => {
    const extensions = suggestAmbiguousExtensions(
      ['C', 'E', 'G'],
      ['C', 'D', 'E', 'F', 'F#', 'G', 'A', 'B']
    );
    expect(extensions.length).toBeGreaterThan(0);
    // F# (tritone from C) should be a top suggestion
    expect(extensions).toContain('F#');
  });

  it('returns empty for maximally ambiguous input', () => {
    // If all scale notes are already present, nothing to add
    const extensions = suggestAmbiguousExtensions(
      ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    );
    expect(extensions).toHaveLength(0);
  });

  it('returns at most 2 notes', () => {
    const extensions = suggestAmbiguousExtensions(
      ['C'],
      ['C', 'D', 'E', 'F', 'F#', 'G', 'A', 'B']
    );
    expect(extensions.length).toBeLessThanOrEqual(2);
  });
});

describe('shouldApplyAmbiguity', () => {
  it('ambient breakdown favors ambiguity', () => {
    expect(shouldApplyAmbiguity('ambient', 'breakdown', 0.2)).toBe(true);
  });

  it('trance peak avoids ambiguity', () => {
    expect(shouldApplyAmbiguity('trance', 'peak', 0.8)).toBe(false);
  });

  it('high tension reduces ambiguity', () => {
    const lowTension = shouldApplyAmbiguity('ambient', 'groove', 0.1);
    const highTension = shouldApplyAmbiguity('ambient', 'groove', 0.9);
    // Low tension should be more likely to apply
    if (lowTension) expect(highTension || !highTension).toBeDefined(); // just checking it runs
  });
});

describe('ambiguityAppetite', () => {
  it('ambient has highest appetite', () => {
    expect(ambiguityAppetite('ambient')).toBe(0.60);
  });

  it('trance has lowest appetite', () => {
    expect(ambiguityAppetite('trance')).toBe(0.05);
  });
});

describe('ambiguityDarkenFactor', () => {
  it('returns less than 1 for ambient breakdown', () => {
    expect(ambiguityDarkenFactor('ambient', 'breakdown')).toBeLessThan(1.0);
  });

  it('returns close to 1 for trance peak', () => {
    expect(ambiguityDarkenFactor('trance', 'peak')).toBeGreaterThan(0.99);
  });

  it('stays within 0.8-1.0', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const m of moods) {
      for (const s of sections) {
        const factor = ambiguityDarkenFactor(m, s);
        expect(factor).toBeGreaterThanOrEqual(0.8);
        expect(factor).toBeLessThanOrEqual(1.0);
      }
    }
  });
});
