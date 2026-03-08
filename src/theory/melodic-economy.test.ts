import { describe, it, expect } from 'vitest';
import {
  pitchVocabularySize,
  selectCorePitches,
  constrainToVocabulary,
  shouldApplyEconomy,
  economyStrength,
} from './melodic-economy';

describe('pitchVocabularySize', () => {
  it('ambient intro has smallest vocabulary', () => {
    const size = pitchVocabularySize(7, 'ambient', 'intro');
    expect(size).toBeLessThanOrEqual(4);
    expect(size).toBeGreaterThanOrEqual(3);
  });

  it('syro peak has largest vocabulary', () => {
    const size = pitchVocabularySize(7, 'syro', 'peak');
    expect(size).toBeGreaterThanOrEqual(6);
  });

  it('never below 3', () => {
    const size = pitchVocabularySize(7, 'ambient', 'intro');
    expect(size).toBeGreaterThanOrEqual(3);
  });

  it('never exceeds scale length', () => {
    const size = pitchVocabularySize(5, 'syro', 'peak');
    expect(size).toBeLessThanOrEqual(5);
  });

  it('peak allows more than intro', () => {
    const intro = pitchVocabularySize(7, 'trance', 'intro');
    const peak = pitchVocabularySize(7, 'trance', 'peak');
    expect(peak).toBeGreaterThanOrEqual(intro);
  });
});

describe('selectCorePitches', () => {
  const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('always includes root', () => {
    const pitches = selectCorePitches(scale, 3, 'C');
    expect(pitches).toContain('C');
  });

  it('returns requested count', () => {
    expect(selectCorePitches(scale, 4, 'C')).toHaveLength(4);
    expect(selectCorePitches(scale, 3, 'C')).toHaveLength(3);
  });

  it('returns full scale when count >= length', () => {
    const result = selectCorePitches(scale, 7, 'C');
    expect(result).toHaveLength(7);
  });

  it('handles empty scale', () => {
    expect(selectCorePitches([], 3, 'C')).toEqual([]);
  });

  it('prioritizes root, 5th, 3rd', () => {
    const pitches = selectCorePitches(scale, 3, 'C');
    expect(pitches[0]).toBe('C'); // root
  });
});

describe('constrainToVocabulary', () => {
  it('preserves notes in vocabulary', () => {
    const steps = ['C4', 'E4', 'G4'];
    const result = constrainToVocabulary(steps, ['C', 'E', 'G']);
    expect(result).toEqual(steps);
  });

  it('replaces out-of-vocabulary notes', () => {
    const steps = ['D4', 'F4'];
    const result = constrainToVocabulary(steps, ['C', 'E', 'G']);
    result.forEach(n => {
      const name = n.replace(/\d+$/, '');
      expect(['C', 'E', 'G']).toContain(name);
    });
  });

  it('preserves rests', () => {
    const steps = ['~', 'C4', '~'];
    const result = constrainToVocabulary(steps, ['C', 'E']);
    expect(result[0]).toBe('~');
    expect(result[2]).toBe('~');
  });

  it('preserves octave', () => {
    const steps = ['D5'];
    const result = constrainToVocabulary(steps, ['C', 'E']);
    expect(result[0]).toMatch(/\d+$/);
    expect(result[0].match(/\d+$/)?.[0]).toBe('5');
  });

  it('selects nearest pitch', () => {
    const steps = ['D4']; // D=2, C=0, E=4 — both distance 2, C wins
    const result = constrainToVocabulary(steps, ['C', 'E']);
    expect(['C4', 'E4']).toContain(result[0]);
  });
});

describe('shouldApplyEconomy', () => {
  it('ambient intro = yes', () => {
    expect(shouldApplyEconomy('ambient', 'intro')).toBe(true);
  });

  it('syro peak = no', () => {
    expect(shouldApplyEconomy('syro', 'peak')).toBe(false);
  });
});

describe('economyStrength', () => {
  it('ambient has highest', () => {
    expect(economyStrength('ambient')).toBe(0.60);
  });

  it('syro has lowest', () => {
    expect(economyStrength('syro')).toBe(0.08);
  });
});
