import { describe, it, expect } from 'vitest';
import {
  currentPhraseRole,
  phraseLength,
  phrasePosition,
  isInCadenceZone,
  phraseCadenceBias,
  moodPhraseStrength,
  sectionPhraseMultiplier,
} from './phrase-harmony';

describe('phraseLength', () => {
  it('trance has shorter phrases than ambient', () => {
    expect(phraseLength('trance')).toBeLessThan(phraseLength('ambient'));
  });

  it('all moods return positive lengths', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      expect(phraseLength(m)).toBeGreaterThan(0);
    }
  });
});

describe('currentPhraseRole', () => {
  it('first phrase is antecedent', () => {
    expect(currentPhraseRole(0, 'trance')).toBe('antecedent');
  });

  it('second phrase is consequent', () => {
    const len = phraseLength('trance');
    expect(currentPhraseRole(len, 'trance')).toBe('consequent');
  });

  it('alternates between roles', () => {
    const len = phraseLength('lofi');
    expect(currentPhraseRole(0, 'lofi')).toBe('antecedent');
    expect(currentPhraseRole(len, 'lofi')).toBe('consequent');
    expect(currentPhraseRole(len * 2, 'lofi')).toBe('antecedent');
    expect(currentPhraseRole(len * 3, 'lofi')).toBe('consequent');
  });
});

describe('phrasePosition', () => {
  it('returns 0 at phrase start', () => {
    expect(phrasePosition(0, 'trance')).toBe(0);
  });

  it('returns 1 at phrase end', () => {
    const len = phraseLength('trance');
    expect(phrasePosition(len - 1, 'trance')).toBeCloseTo(1.0);
  });

  it('returns value between 0 and 1', () => {
    const pos = phrasePosition(3, 'lofi');
    expect(pos).toBeGreaterThanOrEqual(0);
    expect(pos).toBeLessThanOrEqual(1);
  });
});

describe('isInCadenceZone', () => {
  it('not in cadence zone at phrase start', () => {
    expect(isInCadenceZone(0, 'lofi')).toBe(false);
  });

  it('in cadence zone near phrase end', () => {
    const len = phraseLength('lofi');
    expect(isInCadenceZone(len - 1, 'lofi')).toBe(true);
  });
});

describe('phraseCadenceBias', () => {
  it('returns 7 weights', () => {
    const bias = phraseCadenceBias(0, 'trance', 'groove');
    expect(bias).toHaveLength(7);
  });

  it('neutral weights away from phrase boundaries', () => {
    const bias = phraseCadenceBias(0, 'trance', 'groove');
    expect(bias).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it('antecedent ending boosts V (degree 4)', () => {
    const len = phraseLength('trance');
    // Last tick of first phrase (antecedent)
    const bias = phraseCadenceBias(len - 1, 'trance', 'groove');
    expect(bias[4]).toBeGreaterThan(1.0); // V boosted
  });

  it('antecedent ending suppresses I (degree 0)', () => {
    const len = phraseLength('trance');
    const bias = phraseCadenceBias(len - 1, 'trance', 'groove');
    expect(bias[0]).toBeLessThan(1.0); // I suppressed in question
  });

  it('consequent ending boosts I (degree 0)', () => {
    const len = phraseLength('trance');
    // Last tick of second phrase (consequent)
    const bias = phraseCadenceBias(len * 2 - 1, 'trance', 'groove');
    expect(bias[0]).toBeGreaterThan(1.0); // I boosted in answer
  });

  it('trance has stronger bias than ambient', () => {
    const len = phraseLength('trance');
    const tranceBias = phraseCadenceBias(len - 1, 'trance', 'groove');
    // For ambient we need to use ambient's phrase length
    const ambLen = phraseLength('ambient');
    const ambientBias = phraseCadenceBias(ambLen - 1, 'ambient', 'groove');
    // Trance V boost should be stronger
    expect(tranceBias[4] - 1).toBeGreaterThan(ambientBias[4] - 1);
  });

  it('breakdown section weakens bias', () => {
    const len = phraseLength('trance');
    const grooveBias = phraseCadenceBias(len - 1, 'trance', 'groove');
    const breakdownBias = phraseCadenceBias(len - 1, 'trance', 'breakdown');
    // Groove should have stronger V boost
    expect(grooveBias[4]).toBeGreaterThan(breakdownBias[4]);
  });
});

describe('moodPhraseStrength', () => {
  it('trance is strongest', () => {
    expect(moodPhraseStrength('trance')).toBeGreaterThan(moodPhraseStrength('ambient'));
  });

  it('all values between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const s = moodPhraseStrength(m);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe('sectionPhraseMultiplier', () => {
  it('groove has highest multiplier', () => {
    expect(sectionPhraseMultiplier('groove')).toBeGreaterThan(sectionPhraseMultiplier('breakdown'));
  });

  it('all sections return positive values', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      expect(sectionPhraseMultiplier(s)).toBeGreaterThan(0);
    }
  });
});
