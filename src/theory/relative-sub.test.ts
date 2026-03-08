import { describe, it, expect } from 'vitest';
import {
  relativeSubstitute,
  shouldApplyRelativeSub,
  relativeSubChord,
  relativeSubProbability,
} from './relative-sub';
import type { NoteName, ChordQuality } from '../types';

describe('relativeSubstitute', () => {
  it('C major → A minor (down 3 semitones)', () => {
    const sub = relativeSubstitute('C' as NoteName, 'maj');
    expect(sub.root).toBe('A');
    expect(sub.quality).toBe('min');
  });

  it('A minor → C major (up 3 semitones)', () => {
    const sub = relativeSubstitute('A' as NoteName, 'min');
    expect(sub.root).toBe('C');
    expect(sub.quality).toBe('maj');
  });

  it('Cmaj7 → Amin7', () => {
    const sub = relativeSubstitute('C' as NoteName, 'maj7');
    expect(sub.root).toBe('A');
    expect(sub.quality).toBe('min7');
  });

  it('Amin7 → Cmaj7', () => {
    const sub = relativeSubstitute('A' as NoteName, 'min7');
    expect(sub.root).toBe('C');
    expect(sub.quality).toBe('maj7');
  });

  it('dom7 returns unchanged (special function)', () => {
    const sub = relativeSubstitute('G' as NoteName, 'dom7');
    expect(sub.root).toBe('G');
    expect(sub.quality).toBe('dom7');
  });

  it('dim returns unchanged', () => {
    const sub = relativeSubstitute('B' as NoteName, 'dim');
    expect(sub.root).toBe('B');
    expect(sub.quality).toBe('dim');
  });

  it('F major → D minor', () => {
    const sub = relativeSubstitute('F' as NoteName, 'maj');
    expect(sub.root).toBe('D');
    expect(sub.quality).toBe('min');
  });
});

describe('shouldApplyRelativeSub', () => {
  it('lofi has reasonable probability for major chord', () => {
    let count = 0;
    for (let i = 0; i < 500; i++) {
      if (shouldApplyRelativeSub(0, 'maj', 'lofi', 'groove')) count++;
    }
    // lofi=0.18, groove=1.0 → ~90 hits
    expect(count).toBeGreaterThan(50);
    expect(count).toBeLessThan(140);
  });

  it('rejects dominant chords (degree 4)', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyRelativeSub(4, 'maj', 'lofi', 'groove')) count++;
    }
    expect(count).toBe(0);
  });

  it('rejects dom7 quality', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyRelativeSub(2, 'dom7', 'lofi', 'groove')) count++;
    }
    expect(count).toBe(0);
  });

  it('breakdown section boosts probability', () => {
    let grooveCount = 0;
    let breakdownCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (shouldApplyRelativeSub(0, 'maj', 'lofi', 'groove')) grooveCount++;
      if (shouldApplyRelativeSub(0, 'maj', 'lofi', 'breakdown')) breakdownCount++;
    }
    expect(breakdownCount).toBeGreaterThan(grooveCount);
  });

  it('trance rarely substitutes', () => {
    let count = 0;
    for (let i = 0; i < 500; i++) {
      if (shouldApplyRelativeSub(0, 'maj', 'trance', 'groove')) count++;
    }
    expect(count).toBeLessThan(30);
  });
});

describe('relativeSubChord', () => {
  it('returns notes with octave', () => {
    const sub = relativeSubChord('C' as NoteName, 'maj', 3);
    expect(sub.notes.length).toBeGreaterThan(0);
    for (const n of sub.notes) {
      expect(/\d$/.test(n)).toBe(true);
    }
  });

  it('quality matches substitution', () => {
    const sub = relativeSubChord('C' as NoteName, 'maj', 3);
    expect(sub.quality).toBe('min');
    expect(sub.root).toBe('A');
  });
});

describe('relativeSubProbability', () => {
  it('lofi is highest', () => {
    expect(relativeSubProbability('lofi')).toBe(0.18);
  });

  it('trance is low', () => {
    expect(relativeSubProbability('trance')).toBe(0.03);
  });
});
