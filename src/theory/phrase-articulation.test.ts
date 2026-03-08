import { describe, it, expect } from 'vitest';
import { phraseArticulation, articulationToGainPattern, phraseGainAccents } from './phrase-articulation';

describe('phraseArticulation', () => {
  it('returns correct length', () => {
    const result = phraseArticulation(['C3', '~', 'E3', 'G3', '~'], 'lofi');
    expect(result).toHaveLength(5);
  });

  it('rests get neutral multipliers', () => {
    const result = phraseArticulation(['~', 'C3', '~'], 'lofi');
    expect(result[0].attackMult).toBe(1.0);
    expect(result[0].decayMult).toBe(1.0);
  });

  it('first note has crisper attack', () => {
    const result = phraseArticulation(['C3', 'E3', 'G3'], 'avril');
    expect(result[0].attackMult).toBeLessThan(1.0); // crisper
  });

  it('middle notes have softer attack (legato)', () => {
    const result = phraseArticulation(['C3', 'E3', 'G3', 'B3'], 'avril');
    expect(result[1].attackMult).toBeGreaterThan(1.0); // softer onset
    expect(result[2].attackMult).toBeGreaterThan(1.0);
  });

  it('last note has longer release', () => {
    const result = phraseArticulation(['C3', 'E3', 'G3'], 'avril');
    expect(result[2].releaseMult).toBeGreaterThan(1.0); // longer tail
  });

  it('solo notes (surrounded by rests) get clear attack', () => {
    const result = phraseArticulation(['~', 'C3', '~'], 'lofi');
    expect(result[1].attackMult).toBeLessThan(1.0);
    expect(result[1].releaseMult).toBeGreaterThan(1.0);
  });

  it('re-entry after rest gets crisp attack', () => {
    const result = phraseArticulation(['C3', '~', 'E3', 'G3'], 'avril');
    // E3 at index 2 is a re-entry
    expect(result[2].attackMult).toBeLessThan(1.0);
  });

  it('trance has minimal expression (near neutral)', () => {
    const result = phraseArticulation(['C3', 'E3', 'G3'], 'trance');
    // With 0.2 depth, middle note attack should be close to 1.0
    expect(result[1].attackMult).toBeGreaterThan(1.0);
    expect(result[1].attackMult).toBeLessThan(1.1); // barely above 1
  });

  it('avril has strong expression', () => {
    const avril = phraseArticulation(['C3', 'E3', 'G3'], 'avril');
    const trance = phraseArticulation(['C3', 'E3', 'G3'], 'trance');
    // Avril's middle note should have more legato than trance's
    expect(avril[1].attackMult).toBeGreaterThan(trance[1].attackMult);
  });

  it('handles empty array', () => {
    expect(phraseArticulation([], 'lofi')).toEqual([]);
  });

  it('handles all rests', () => {
    const result = phraseArticulation(['~', '~', '~'], 'lofi');
    result.forEach(m => {
      expect(m.attackMult).toBe(1.0);
      expect(m.releaseMult).toBe(1.0);
    });
  });
});

describe('articulationToGainPattern', () => {
  it('returns space-separated strings', () => {
    const mults = phraseArticulation(['C3', 'E3'], 'lofi');
    const pattern = articulationToGainPattern(mults);
    expect(pattern.attack.split(' ')).toHaveLength(2);
    expect(pattern.decay.split(' ')).toHaveLength(2);
    expect(pattern.sustain.split(' ')).toHaveLength(2);
    expect(pattern.release.split(' ')).toHaveLength(2);
  });

  it('values are parseable as floats', () => {
    const mults = phraseArticulation(['C3', '~', 'G3'], 'downtempo');
    const pattern = articulationToGainPattern(mults);
    pattern.attack.split(' ').forEach(v => expect(parseFloat(v)).not.toBeNaN());
  });
});

describe('phraseGainAccents', () => {
  it('returns correct length', () => {
    const accents = phraseGainAccents(['C3', '~', 'E3', 'G3'], 'lofi');
    expect(accents).toHaveLength(4);
  });

  it('rests get neutral 1.0', () => {
    const accents = phraseGainAccents(['C3', '~', 'E3'], 'lofi');
    expect(accents[1]).toBe(1.0);
  });

  it('first note is accented (> 1)', () => {
    const accents = phraseGainAccents(['C3', 'E3', 'G3'], 'avril');
    expect(accents[0]).toBeGreaterThan(1.0);
  });

  it('last note tapers (< 1)', () => {
    const accents = phraseGainAccents(['C3', 'E3', 'G3'], 'avril');
    expect(accents[2]).toBeLessThan(1.0);
  });

  it('trance accents are closer to neutral', () => {
    const avril = phraseGainAccents(['C3', 'E3', 'G3'], 'avril');
    const trance = phraseGainAccents(['C3', 'E3', 'G3'], 'trance');
    // Avril first note accent should be stronger than trance
    expect(avril[0] - 1.0).toBeGreaterThan(trance[0] - 1.0);
  });

  it('all values are positive', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const accents = phraseGainAccents(['C3', 'E3', '~', 'G3', 'B3'], mood);
      for (const a of accents) {
        expect(a).toBeGreaterThan(0);
      }
    }
  });
});
