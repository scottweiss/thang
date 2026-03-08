import { describe, it, expect } from 'vitest';
import { getBorrowedChords } from './modal-interchange';

describe('getBorrowedChords', () => {
  it('returns borrowed chords for major scale', () => {
    const borrowed = getBorrowedChords('major');
    expect(borrowed.length).toBeGreaterThan(0);
    // Should include the classic bVI from parallel minor
    const bVI = borrowed.find(b => b.degree === 5 && b.quality === 'maj');
    expect(bVI).toBeDefined();
  });

  it('returns borrowed chords for minor scale', () => {
    const borrowed = getBorrowedChords('minor');
    expect(borrowed.length).toBeGreaterThan(0);
    // Should include IV from parallel major
    const IV = borrowed.find(b => b.degree === 3 && b.quality === 'maj');
    expect(IV).toBeDefined();
  });

  it('returns borrowed chords for aeolian (alias for minor)', () => {
    const borrowed = getBorrowedChords('aeolian');
    expect(borrowed).toEqual(getBorrowedChords('minor'));
  });

  it('dorian excludes its own characteristic chord', () => {
    const borrowed = getBorrowedChords('dorian');
    const dorianII = borrowed.find(b => b.source === 'dorian ii');
    expect(dorianII).toBeUndefined();
  });

  it('returns empty for pentatonic scales', () => {
    expect(getBorrowedChords('pentatonic')).toEqual([]);
  });

  it('all borrowed chords have tension values', () => {
    const borrowed = getBorrowedChords('major');
    borrowed.forEach(b => {
      expect(b.tension).toBeGreaterThan(0);
      expect(b.tension).toBeLessThanOrEqual(1);
    });
  });
});
