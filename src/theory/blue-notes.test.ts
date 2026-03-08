import { describe, it, expect } from 'vitest';
import { getBlueNoteConfig, applyBlueNote, applyBlueNotes } from './blue-notes';

const C_MAJOR = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

describe('getBlueNoteConfig', () => {
  it('lofi has higher probability than trance', () => {
    expect(getBlueNoteConfig('lofi').probability).toBeGreaterThan(
      getBlueNoteConfig('trance').probability
    );
  });

  it('all moods return valid config', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const config = getBlueNoteConfig(m);
      expect(config.probability).toBeGreaterThan(0);
      expect(config.probability).toBeLessThanOrEqual(1);
      expect(config.inflections.length).toBeGreaterThan(0);
    }
  });

  it('lofi has b3 b7 b5 inflections', () => {
    const config = getBlueNoteConfig('lofi');
    const degrees = config.inflections.map(i => i.degree);
    expect(degrees).toContain(2); // 3rd degree (0-indexed)
    expect(degrees).toContain(6); // 7th degree
    expect(degrees).toContain(4); // 5th degree
  });
});

describe('applyBlueNote', () => {
  it('returns original note when probability fails', () => {
    // With ambient's very low probability, most calls return original
    let unchanged = 0;
    for (let i = 0; i < 100; i++) {
      if (applyBlueNote('E4', C_MAJOR, 'ambient', 0.5) === 'E4') unchanged++;
    }
    expect(unchanged).toBeGreaterThan(80);
  });

  it('returns original for rests', () => {
    expect(applyBlueNote('~', C_MAJOR, 'lofi', 0.5)).toBe('~');
  });

  it('returns original for non-scale notes', () => {
    // C# is not in C major scale
    expect(applyBlueNote('C#4', C_MAJOR, 'lofi', 0.5)).toBe('C#4');
  });

  it('altered note has valid format', () => {
    // Run many times — when altered, should still be valid note
    for (let i = 0; i < 200; i++) {
      const result = applyBlueNote('E4', C_MAJOR, 'lofi', 1.0);
      expect(result).toMatch(/^[A-G][#]?\d+$/);
    }
  });

  it('E in C major can become D# (b3 blue note)', () => {
    // With lofi at high tension, should sometimes alter E to D# (Eb = b3)
    const results = new Set<string>();
    for (let i = 0; i < 500; i++) {
      results.add(applyBlueNote('E4', C_MAJOR, 'lofi', 1.0));
    }
    expect(results.has('D#4')).toBe(true); // ♭3
  });

  it('B in C major can become A# (b7 blue note)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 500; i++) {
      results.add(applyBlueNote('B4', C_MAJOR, 'lofi', 1.0));
    }
    expect(results.has('A#4')).toBe(true); // ♭7
  });

  it('higher tension increases blue note probability', () => {
    let lowTensionAltered = 0;
    let highTensionAltered = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
      if (applyBlueNote('E4', C_MAJOR, 'lofi', 0.1) !== 'E4') lowTensionAltered++;
      if (applyBlueNote('E4', C_MAJOR, 'lofi', 0.9) !== 'E4') highTensionAltered++;
    }
    expect(highTensionAltered).toBeGreaterThan(lowTensionAltered);
  });

  it('does not alter notes on non-inflectable degrees', () => {
    // In lofi, only degrees 2, 4, 6 are inflectable
    // C is degree 0 — should never be altered
    let altered = 0;
    for (let i = 0; i < 500; i++) {
      if (applyBlueNote('C4', C_MAJOR, 'lofi', 1.0) !== 'C4') altered++;
    }
    expect(altered).toBe(0);
  });
});

describe('applyBlueNotes', () => {
  it('preserves rests', () => {
    const result = applyBlueNotes(['C4', '~', 'E4', '~'], C_MAJOR, 'lofi', 0.5);
    expect(result[1]).toBe('~');
    expect(result[3]).toBe('~');
  });

  it('returns same length', () => {
    const input = ['C4', 'D4', 'E4', 'F4', 'G4'];
    const result = applyBlueNotes(input, C_MAJOR, 'lofi', 0.5);
    expect(result).toHaveLength(5);
  });

  it('all notes have valid format', () => {
    const input = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    for (let i = 0; i < 50; i++) {
      const result = applyBlueNotes(input, C_MAJOR, 'lofi', 0.8);
      for (const note of result) {
        expect(note).toMatch(/^[A-G][#]?\d+$/);
      }
    }
  });
});
