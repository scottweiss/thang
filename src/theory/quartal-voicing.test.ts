import { describe, it, expect } from 'vitest';
import {
  shouldApplyQuartal,
  quartalVoicing,
  quintalVoicing,
  selectVoicingType,
  quartalVoiceCount,
  quartalTendency,
} from './quartal-voicing';

describe('shouldApplyQuartal', () => {
  it('is deterministic', () => {
    const a = shouldApplyQuartal(42, 'ambient', 'breakdown');
    const b = shouldApplyQuartal(42, 'ambient', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more quartal than peak', () => {
    const breakdownCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyQuartal(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyQuartal(i, 'ambient', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('quartalVoicing', () => {
  it('stacks perfect 4ths from C', () => {
    const voicing = quartalVoicing('C', 3, 4);
    expect(voicing).toHaveLength(4);
    expect(voicing[0]).toBe('C3');   // root
    expect(voicing[1]).toBe('F3');   // P4 above C
    expect(voicing[2]).toBe('Bb3'); // P4 above F
    expect(voicing[3]).toBe('Eb4'); // P4 above Bb
  });

  it('respects voice count', () => {
    expect(quartalVoicing('G', 4, 3)).toHaveLength(3);
    expect(quartalVoicing('D', 3, 5)).toHaveLength(5);
  });

  it('handles octave boundaries', () => {
    const voicing = quartalVoicing('A', 3, 4);
    expect(voicing[0]).toBe('A3');
    // A + P4 = D4
    expect(voicing[1]).toBe('D4');
  });

  it('clamps to max octave 6', () => {
    const voicing = quartalVoicing('C', 5, 5);
    for (const note of voicing) {
      const oct = parseInt(note.match(/\d+$/)?.[0] ?? '3');
      expect(oct).toBeLessThanOrEqual(6);
    }
  });
});

describe('quintalVoicing', () => {
  it('stacks perfect 5ths from C', () => {
    const voicing = quintalVoicing('C', 3, 3);
    expect(voicing).toHaveLength(3);
    expect(voicing[0]).toBe('C3');  // root
    expect(voicing[1]).toBe('G3');  // P5 above C
    expect(voicing[2]).toBe('D4'); // P5 above G
  });

  it('creates wider spread than quartal', () => {
    const q4 = quartalVoicing('C', 3, 3);
    const q5 = quintalVoicing('C', 3, 3);
    // Quintal spans wider intervals
    const q4TopOct = parseInt(q4[2].match(/\d+$/)?.[0] ?? '3');
    const q5TopOct = parseInt(q5[2].match(/\d+$/)?.[0] ?? '3');
    expect(q5TopOct).toBeGreaterThanOrEqual(q4TopOct);
  });
});

describe('selectVoicingType', () => {
  it('is deterministic', () => {
    const a = selectVoicingType('lofi', 42);
    const b = selectVoicingType('lofi', 42);
    expect(a).toBe(b);
  });

  it('returns valid type', () => {
    const result = selectVoicingType('ambient', 100);
    expect(['quartal', 'quintal']).toContain(result);
  });
});

describe('quartalVoiceCount', () => {
  it('breakdown uses fewer voices', () => {
    expect(quartalVoiceCount('breakdown')).toBe(3);
  });

  it('peak uses more voices', () => {
    expect(quartalVoiceCount('peak')).toBe(4);
  });
});

describe('quartalTendency', () => {
  it('ambient has highest', () => {
    expect(quartalTendency('ambient')).toBe(0.40);
  });

  it('trance has lowest', () => {
    expect(quartalTendency('trance')).toBe(0.03);
  });
});
