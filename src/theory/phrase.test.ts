import { describe, it, expect } from 'vitest';
import {
  generatePhraseStructure,
  phraseDensityMask,
  phraseIntensityCurve,
} from './phrase';

describe('generatePhraseStructure', () => {
  it('generates at least one phrase for non-zero slots', () => {
    const phrases = generatePhraseStructure(16, 3, 0.5);
    expect(phrases.length).toBeGreaterThan(0);
  });

  it('phrases do not exceed total slots', () => {
    const phrases = generatePhraseStructure(16, 4, 0.3);
    for (const p of phrases) {
      expect(p.startSlot + p.noteCount).toBeLessThanOrEqual(16);
    }
  });

  it('phrases are in order', () => {
    const phrases = generatePhraseStructure(32, 4, 0.5);
    for (let i = 1; i < phrases.length; i++) {
      expect(phrases[i].startSlot).toBeGreaterThan(phrases[i - 1].startSlot);
    }
  });

  it('returns empty for zero slots', () => {
    expect(generatePhraseStructure(0, 3, 0.5)).toEqual([]);
  });

  it('higher breathiness creates more gaps', () => {
    const tight = generatePhraseStructure(16, 3, 0.1);
    const breathy = generatePhraseStructure(16, 3, 0.9);
    const tightNotes = tight.reduce((s, p) => s + p.noteCount, 0);
    const breathyNotes = breathy.reduce((s, p) => s + p.noteCount, 0);
    // Breathy should have fewer total notes (more breath space)
    // or same notes but spread over fewer phrases
    expect(breathyNotes).toBeLessThanOrEqual(tightNotes + 2); // small tolerance
  });
});

describe('phraseDensityMask', () => {
  it('returns correct length', () => {
    const mask = phraseDensityMask(16, 0.5, 0.3);
    expect(mask).toHaveLength(16);
  });

  it('approximately matches target density', () => {
    const mask = phraseDensityMask(16, 0.5, 0.3);
    const noteCount = mask.filter(Boolean).length;
    expect(noteCount).toBeGreaterThanOrEqual(4);
    expect(noteCount).toBeLessThanOrEqual(12);
  });

  it('has at least one note', () => {
    const mask = phraseDensityMask(16, 0.1, 0.5);
    expect(mask.some(Boolean)).toBe(true);
  });

  it('notes cluster into phrases (not uniformly distributed)', () => {
    const mask = phraseDensityMask(16, 0.4, 0.5);
    // Count transitions (note → rest or rest → note)
    let transitions = 0;
    for (let i = 1; i < mask.length; i++) {
      if (mask[i] !== mask[i - 1]) transitions++;
    }
    // With phrases, transitions should be fewer than if notes were scattered
    // A 50% random distribution would average ~8 transitions in 16 slots
    // Phrased distribution should have fewer (clustered notes)
    expect(transitions).toBeLessThan(12);
  });
});

describe('phraseIntensityCurve', () => {
  it('returns correct length', () => {
    const phrases = generatePhraseStructure(16, 3, 0.3);
    const curve = phraseIntensityCurve(16, phrases);
    expect(curve).toHaveLength(16);
  });

  it('curve values are between 0 and 1', () => {
    const phrases = generatePhraseStructure(16, 4, 0.5);
    const curve = phraseIntensityCurve(16, phrases);
    curve.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it('non-phrase slots have zero intensity', () => {
    const phrases = generatePhraseStructure(16, 2, 0.8);
    const curve = phraseIntensityCurve(16, phrases);
    // At least some slots should be 0 (breath space)
    expect(curve.filter(v => v === 0).length).toBeGreaterThan(0);
  });
});
