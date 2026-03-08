import { describe, it, expect } from 'vitest';
import {
  overtoneVoicing,
  fieldPartials,
  shouldApplyField,
  blendVoicings,
  fieldTendency,
} from './harmonic-field';

describe('overtoneVoicing', () => {
  it('first partial is the root', () => {
    const voicing = overtoneVoicing('C', 3, 3);
    expect(voicing[0]).toBe('C3');
  });

  it('second partial is octave above', () => {
    const voicing = overtoneVoicing('C', 3, 3);
    expect(voicing[1]).toBe('C4'); // octave
  });

  it('third partial is fifth above octave', () => {
    const voicing = overtoneVoicing('C', 3, 3);
    expect(voicing[2]).toBe('G4'); // octave + fifth = 19 semitones from C3
  });

  it('returns correct number of notes', () => {
    expect(overtoneVoicing('C', 3, 4)).toHaveLength(4);
    expect(overtoneVoicing('C', 3, 6)).toHaveLength(6);
  });

  it('clamps partials to 2-8', () => {
    expect(overtoneVoicing('C', 3, 1)).toHaveLength(2);
    expect(overtoneVoicing('C', 3, 10)).toHaveLength(8);
  });

  it('works for different roots', () => {
    const voicing = overtoneVoicing('A', 2, 3);
    expect(voicing[0]).toBe('A2');
    expect(voicing[1]).toBe('A3');
  });
});

describe('fieldPartials', () => {
  it('ambient has most partials', () => {
    expect(fieldPartials('ambient', 'groove')).toBeGreaterThanOrEqual(5);
  });

  it('trance has fewest partials', () => {
    expect(fieldPartials('trance', 'groove')).toBeLessThanOrEqual(4);
  });

  it('breakdown adds partials', () => {
    const groove = fieldPartials('ambient', 'groove');
    const breakdown = fieldPartials('ambient', 'breakdown');
    expect(breakdown).toBeGreaterThanOrEqual(groove);
  });
});

describe('shouldApplyField', () => {
  it('is deterministic', () => {
    const a = shouldApplyField(42, 'ambient', 'breakdown');
    const b = shouldApplyField(42, 'ambient', 'breakdown');
    expect(a).toBe(b);
  });

  it('ambient has more than trance', () => {
    const ambientCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyField(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyField(i, 'trance', 'breakdown')
    ).filter(Boolean).length;
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });
});

describe('blendVoicings', () => {
  const conv = ['C3', 'E3', 'G3'];
  const over = ['C3', 'C4', 'G4', 'C5'];

  it('blend 0 = all conventional', () => {
    const result = blendVoicings(conv, over, 0);
    expect(result).toEqual(conv);
  });

  it('blend 1 = all overtone', () => {
    const result = blendVoicings(conv, over, 1);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(n => over.includes(n))).toBe(true);
  });

  it('avoids duplicates', () => {
    const result = blendVoicings(conv, over, 0.5);
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });
});

describe('fieldTendency', () => {
  it('ambient has highest', () => {
    expect(fieldTendency('ambient')).toBe(0.45);
  });

  it('trance has lowest', () => {
    expect(fieldTendency('trance')).toBe(0.03);
  });
});
