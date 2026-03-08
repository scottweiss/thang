import { describe, it, expect } from 'vitest';
import {
  tritoneSubRoot,
  tritoneSubNotes,
  shouldApplyTritoneSub,
  tritoneSubProbability,
} from './tritone-sub';
import type { NoteName } from '../types';

describe('tritoneSubRoot', () => {
  it('C → F#/Gb (6 semitones)', () => {
    const sub = tritoneSubRoot('C' as NoteName);
    // 6 semitones from C = F# or Gb
    expect(['F#', 'Gb']).toContain(sub);
  });

  it('G → Db/C# (tritone of G)', () => {
    const sub = tritoneSubRoot('G' as NoteName);
    expect(['Db', 'C#']).toContain(sub);
  });

  it('D → Ab/G# (tritone of D)', () => {
    const sub = tritoneSubRoot('D' as NoteName);
    expect(['Ab', 'G#']).toContain(sub);
  });

  it('is its own inverse (applying twice returns original enharmonic)', () => {
    const root = 'C' as NoteName;
    const sub1 = tritoneSubRoot(root);
    const sub2 = tritoneSubRoot(sub1);
    // C → F#/Gb → C (enharmonically)
    // noteIndex maps both back to 0
    expect(['C', 'B#']).toContain(sub2);
  });
});

describe('tritoneSubNotes', () => {
  it('returns 4 notes (dom7 voicing)', () => {
    const notes = tritoneSubNotes('G' as NoteName, 3);
    expect(notes).toHaveLength(4);
  });

  it('all notes have octave numbers', () => {
    const notes = tritoneSubNotes('C' as NoteName, 4);
    for (const n of notes) {
      expect(/\d$/.test(n)).toBe(true);
    }
  });

  it('7th is in next octave up', () => {
    const notes = tritoneSubNotes('C' as NoteName, 3);
    // Last note (m7) should be octave+1
    expect(notes[3]).toMatch(/4$/);
  });

  it('root is the tritone substitute', () => {
    const notes = tritoneSubNotes('G' as NoteName, 3);
    // Tritone of G is Db/C#, so first note should start with Db or C#
    const rootNote = notes[0].replace(/\d+$/, '');
    expect(['Db', 'C#']).toContain(rootNote);
  });
});

describe('shouldApplyTritoneSub', () => {
  it('only applies to dominant chords (degree 4)', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyTritoneSub(4, 'dom7', 'lofi', 'groove')) count++;
    }
    // lofi=0.25, groove=1.2 → prob=0.30 → ~60 hits
    expect(count).toBeGreaterThan(30);
    expect(count).toBeLessThan(100);
  });

  it('rejects non-dominant degrees without dom7 quality', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyTritoneSub(0, 'min7', 'lofi', 'groove')) count++;
    }
    expect(count).toBe(0);
  });

  it('accepts dom7 quality regardless of degree', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyTritoneSub(1, 'dom7', 'lofi', 'groove')) count++;
    }
    expect(count).toBeGreaterThan(0);
  });

  it('accepts "7" quality as dominant', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyTritoneSub(2, '7', 'lofi', 'groove')) count++;
    }
    expect(count).toBeGreaterThan(0);
  });

  it('ambient never applies', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyTritoneSub(4, 'dom7', 'ambient', 'groove')) count++;
    }
    expect(count).toBe(0);
  });

  it('peak section reduces probability', () => {
    let grooveCount = 0;
    let peakCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (shouldApplyTritoneSub(4, 'dom7', 'lofi', 'groove')) grooveCount++;
      if (shouldApplyTritoneSub(4, 'dom7', 'lofi', 'peak')) peakCount++;
    }
    expect(grooveCount).toBeGreaterThan(peakCount);
  });
});

describe('tritoneSubProbability', () => {
  it('lofi is highest', () => {
    expect(tritoneSubProbability('lofi')).toBe(0.25);
  });

  it('ambient is zero', () => {
    expect(tritoneSubProbability('ambient')).toBe(0.00);
  });

  it('trance is very low', () => {
    expect(tritoneSubProbability('trance')).toBe(0.03);
  });
});
