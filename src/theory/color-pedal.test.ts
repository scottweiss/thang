import { describe, it, expect } from 'vitest';
import {
  shouldApplyColorPedal,
  selectPedalTone,
  pedalPattern,
  pedalOctave,
  colorPedalTendency,
} from './color-pedal';

describe('shouldApplyColorPedal', () => {
  it('is deterministic', () => {
    const a = shouldApplyColorPedal(42, 'ambient', 'breakdown');
    const b = shouldApplyColorPedal(42, 'ambient', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more pedal than peak', () => {
    const breakdownCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyColorPedal(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyColorPedal(i, 'ambient', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('selectPedalTone', () => {
  it('returns a note with octave', () => {
    const tone = selectPedalTone(['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'C', 4, 42);
    expect(tone).toMatch(/^[A-G][#b]?\d$/);
  });

  it('returns a scale note', () => {
    const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const tone = selectPedalTone(scale, 'C', 4, 42);
    const noteName = tone.replace(/\d+$/, '');
    expect(scale).toContain(noteName);
  });

  it('is deterministic', () => {
    const a = selectPedalTone(['C', 'D', 'E', 'F', 'G'], 'C', 4, 42);
    const b = selectPedalTone(['C', 'D', 'E', 'F', 'G'], 'C', 4, 42);
    expect(a).toBe(b);
  });

  it('handles empty scale', () => {
    const tone = selectPedalTone([], 'C', 4, 42);
    expect(tone).toBe('C4');
  });
});

describe('pedalPattern', () => {
  it('creates pattern of correct length', () => {
    const pattern = pedalPattern('G4', 8);
    expect(pattern).toHaveLength(8);
  });

  it('places notes at intervals', () => {
    const pattern = pedalPattern('G4', 8, 0.5);
    // density 0.5 = every 2 steps
    expect(pattern[0]).toBe('G4');
    expect(pattern[2]).toBe('G4');
    expect(pattern[1]).toBe('~');
  });

  it('high density fills more', () => {
    const dense = pedalPattern('E5', 8, 1.0);
    const sparse = pedalPattern('E5', 8, 0.25);
    const denseNotes = dense.filter(n => n !== '~').length;
    const sparseNotes = sparse.filter(n => n !== '~').length;
    expect(denseNotes).toBeGreaterThan(sparseNotes);
  });
});

describe('pedalOctave', () => {
  it('ambient uses high octave', () => {
    expect(pedalOctave('ambient')).toBe(5);
  });

  it('lofi uses middle octave', () => {
    expect(pedalOctave('lofi')).toBe(4);
  });
});

describe('colorPedalTendency', () => {
  it('ambient has highest', () => {
    expect(colorPedalTendency('ambient')).toBe(0.45);
  });

  it('trance has lowest', () => {
    expect(colorPedalTendency('trance')).toBe(0.03);
  });
});
