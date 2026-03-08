import { describe, it, expect } from 'vitest';
import { constrainRange, shouldConstrainRange } from './range-constraint';

describe('constrainRange', () => {
  it('pulls back notes that exceed range', () => {
    // C3 to C5 = 24 semitones, avril max = 12
    const elements = ['C3', 'E3', 'G3', '~', 'C5', '~', 'E3', '~'];
    const result = constrainRange(elements, 'avril');
    // C5 should be shifted down to C4
    expect(result[4]).toBe('C4');
  });

  it('preserves notes within range', () => {
    const elements = ['C4', 'D4', 'E4', '~', 'G4', '~', 'C4', '~'];
    const result = constrainRange(elements, 'avril');
    // All within an octave — no changes
    expect(result).toEqual(elements);
  });

  it('preserves rests', () => {
    const elements = ['C3', '~', '~', '~', 'C5', '~', '~', '~'];
    const result = constrainRange(elements, 'avril');
    expect(result[1]).toBe('~');
    expect(result[2]).toBe('~');
  });

  it('syro does not constrain (24 semitone range)', () => {
    const elements = ['C2', 'E2', '~', '~', 'C5', '~', 'E5', '~'];
    const result = constrainRange(elements, 'syro');
    expect(result).toEqual(elements);
  });

  it('handles short phrases', () => {
    const elements = ['C4', '~'];
    const result = constrainRange(elements, 'avril');
    expect(result).toEqual(elements);
  });

  it('handles all rests', () => {
    const elements = ['~', '~', '~', '~'];
    expect(constrainRange(elements, 'avril')).toEqual(elements);
  });

  it('does not shift notes below octave 1 or above 7', () => {
    const elements = ['C1', 'D1', 'E1', '~', 'C3', '~', '~', '~'];
    const result = constrainRange(elements, 'avril');
    // Even if C1 needs shifting, it shouldn't go below 1
    for (const el of result) {
      if (el !== '~') {
        const oct = parseInt(el.replace(/[^\d]/g, ''));
        expect(oct).toBeGreaterThanOrEqual(1);
        expect(oct).toBeLessThanOrEqual(7);
      }
    }
  });
});

describe('shouldConstrainRange', () => {
  it('true for intimate moods', () => {
    expect(shouldConstrainRange('avril')).toBe(true);
    expect(shouldConstrainRange('flim')).toBe(true);
  });

  it('false for syro (wide range)', () => {
    expect(shouldConstrainRange('syro')).toBe(false);
  });

  it('true for most moods', () => {
    expect(shouldConstrainRange('lofi')).toBe(true);
    expect(shouldConstrainRange('trance')).toBe(true);
  });
});
