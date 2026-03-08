import { describe, it, expect } from 'vitest';
import {
  isConsonantInterval,
  isDissonantAgainstChord,
  suggestPreparation,
  shouldPrepare,
  preparationStrength,
} from './harmonic-preparation';

describe('isConsonantInterval', () => {
  it('unison is consonant', () => {
    expect(isConsonantInterval(0)).toBe(true);
  });

  it('perfect 5th is consonant', () => {
    expect(isConsonantInterval(7)).toBe(true);
  });

  it('minor 2nd is dissonant', () => {
    expect(isConsonantInterval(1)).toBe(false);
  });

  it('tritone is dissonant', () => {
    expect(isConsonantInterval(6)).toBe(false);
  });

  it('major 7th is dissonant', () => {
    expect(isConsonantInterval(11)).toBe(false);
  });

  it('handles negative intervals', () => {
    expect(isConsonantInterval(-7)).toBe(true); // perfect 5th
    expect(isConsonantInterval(-1)).toBe(false); // minor 2nd
  });

  it('handles intervals > 12', () => {
    expect(isConsonantInterval(19)).toBe(true); // 19 mod 12 = 7 = P5
  });
});

describe('isDissonantAgainstChord', () => {
  it('chord tone is not dissonant', () => {
    expect(isDissonantAgainstChord(60, [60, 64, 67])).toBe(false); // C against C-E-G
  });

  it('minor 2nd above root is dissonant', () => {
    expect(isDissonantAgainstChord(61, [60, 64, 67])).toBe(true); // Db against C
  });

  it('perfect 5th is consonant', () => {
    expect(isDissonantAgainstChord(67, [60, 64])).toBe(false); // G against C-E
  });
});

describe('suggestPreparation', () => {
  it('finds nearby consonant preparation', () => {
    // Target is F# (66), dissonant against C major (60,64,67)
    // Should find a nearby consonant note
    const scaleMidis = [60, 62, 64, 65, 67, 69, 71]; // C major scale
    const prep = suggestPreparation(66, [60, 64, 67], scaleMidis);
    expect(prep).not.toBeNull();
    if (prep !== null) {
      expect(Math.abs(prep - 66)).toBeLessThanOrEqual(4);
      expect(isDissonantAgainstChord(prep, [60, 64, 67])).toBe(false);
    }
  });

  it('returns null for empty scale', () => {
    expect(suggestPreparation(66, [60, 64, 67], [])).toBeNull();
  });

  it('prefers closest consonant note', () => {
    const scaleMidis = [60, 62, 64, 65, 67, 69, 71];
    const prep = suggestPreparation(66, [60, 64, 67], scaleMidis);
    // 65 (F) is 1 semitone away and consonant with C major
    // 67 (G) is 1 semitone away and consonant
    expect(prep).not.toBeNull();
    expect(Math.abs(prep! - 66)).toBeLessThanOrEqual(2);
  });
});

describe('shouldPrepare', () => {
  it('varies with tick (hash-based)', () => {
    let hasTrue = false, hasFalse = false;
    for (let t = 0; t < 50; t++) {
      const result = shouldPrepare(t, 'avril', 'groove');
      if (result) hasTrue = true;
      else hasFalse = true;
    }
    expect(hasTrue).toBe(true);
    expect(hasFalse).toBe(true);
  });

  it('breakdown section increases preparation', () => {
    let bdCount = 0, peakCount = 0;
    for (let t = 0; t < 200; t++) {
      if (shouldPrepare(t, 'lofi', 'breakdown')) bdCount++;
      if (shouldPrepare(t, 'lofi', 'peak')) peakCount++;
    }
    expect(bdCount).toBeGreaterThan(peakCount);
  });
});

describe('preparationStrength', () => {
  it('avril is strongest', () => {
    expect(preparationStrength('avril')).toBe(0.55);
  });

  it('trance is weakest', () => {
    expect(preparationStrength('trance')).toBe(0.15);
  });

  it('lofi is high (jazzy)', () => {
    expect(preparationStrength('lofi')).toBe(0.50);
  });
});
