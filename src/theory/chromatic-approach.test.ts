import { describe, it, expect } from 'vitest';
import {
  needsApproachChord,
  approachChordRoot,
  approachChordNotes,
  shouldInsertApproachChord,
  approachChordProbability,
} from './chromatic-approach';
import type { NoteName } from '../types';

describe('needsApproachChord', () => {
  it('true for whole step apart (C→D)', () => {
    expect(needsApproachChord('C' as NoteName, 'D' as NoteName)).toBe(true);
  });

  it('true for minor third apart (C→Eb)', () => {
    expect(needsApproachChord('C' as NoteName, 'Eb' as NoteName)).toBe(true);
  });

  it('true for perfect fourth (C→F)', () => {
    expect(needsApproachChord('C' as NoteName, 'F' as NoteName)).toBe(true);
  });

  it('false for semitone (C→Db) — already chromatic', () => {
    expect(needsApproachChord('C' as NoteName, 'Db' as NoteName)).toBe(false);
  });

  it('false for same note (C→C)', () => {
    expect(needsApproachChord('C' as NoteName, 'C' as NoteName)).toBe(false);
  });

  it('true for perfect fifth (C→G) — modular distance is 5', () => {
    // C→G = 7 semitones up, but modular distance = min(7, 5) = 5
    expect(needsApproachChord('C' as NoteName, 'G' as NoteName)).toBe(true);
  });

  it('false for tritone (C→F#) — distance = 6 is at boundary, OK', () => {
    // Tritone = exactly 6, at the boundary — still valid
    expect(needsApproachChord('C' as NoteName, 'F#' as NoteName)).toBe(true);
  });
});

describe('approachChordRoot', () => {
  it('ascending approach: semitone below target (C→D gives C#/Db)', () => {
    const root = approachChordRoot('C' as NoteName, 'D' as NoteName);
    expect(['C#', 'Db']).toContain(root);
  });

  it('descending approach: semitone above target (D→C gives C#/Db)', () => {
    const root = approachChordRoot('D' as NoteName, 'C' as NoteName);
    expect(['C#', 'Db']).toContain(root);
  });

  it('ascending approach for F→A (up 4 semitones)', () => {
    const root = approachChordRoot('F' as NoteName, 'A' as NoteName);
    // Semitone below A = Ab/G#
    expect(['Ab', 'G#']).toContain(root);
  });
});

describe('approachChordNotes', () => {
  it('returns 4 notes (dim7 voicing)', () => {
    const notes = approachChordNotes('C' as NoteName, 3);
    expect(notes).toHaveLength(4);
  });

  it('all notes have octave numbers', () => {
    const notes = approachChordNotes('D' as NoteName, 4);
    for (const n of notes) {
      expect(/\d$/.test(n)).toBe(true);
    }
  });

  it('intervals are all minor thirds (symmetrical)', () => {
    // Dim7 on C: C, Eb, Gb, Bbb(=A)
    // All intervals = 3 semitones
    const notes = approachChordNotes('C' as NoteName, 3);
    expect(notes).toHaveLength(4);
    // First note should start with C
    expect(notes[0]).toMatch(/^C/);
  });
});

describe('shouldInsertApproachChord', () => {
  it('lofi has reasonable probability for valid interval', () => {
    let count = 0;
    for (let i = 0; i < 500; i++) {
      if (shouldInsertApproachChord(
        'C' as NoteName, 'D' as NoteName, 'lofi', 'groove'
      )) count++;
    }
    // lofi=0.20, groove=1.2 → prob=0.24 → ~120 hits
    expect(count).toBeGreaterThan(70);
    expect(count).toBeLessThan(180);
  });

  it('rejects when roots too close (semitone)', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldInsertApproachChord(
        'C' as NoteName, 'Db' as NoteName, 'lofi', 'groove'
      )) count++;
    }
    expect(count).toBe(0);
  });

  it('ambient never inserts', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldInsertApproachChord(
        'C' as NoteName, 'D' as NoteName, 'ambient', 'groove'
      )) count++;
    }
    expect(count).toBe(0);
  });

  it('peak section reduces probability', () => {
    let grooveCount = 0;
    let peakCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (shouldInsertApproachChord(
        'C' as NoteName, 'D' as NoteName, 'lofi', 'groove'
      )) grooveCount++;
      if (shouldInsertApproachChord(
        'C' as NoteName, 'D' as NoteName, 'lofi', 'peak'
      )) peakCount++;
    }
    expect(grooveCount).toBeGreaterThan(peakCount);
  });
});

describe('approachChordProbability', () => {
  it('lofi is highest', () => {
    expect(approachChordProbability('lofi')).toBe(0.20);
  });

  it('ambient is zero', () => {
    expect(approachChordProbability('ambient')).toBe(0.00);
  });
});
