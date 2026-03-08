import { describe, it, expect } from 'vitest';
import { generateArpSequence, moodArpStyles } from './arp-pattern';

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3'];
const TRIAD = ['C3', 'E3', 'G3'];

describe('generateArpSequence', () => {
  it('up returns ascending cycle', () => {
    const seq = generateArpSequence(TRIAD, 'up', 6);
    expect(seq).toEqual(['C3', 'E3', 'G3', 'C3', 'E3', 'G3']);
  });

  it('down returns descending cycle', () => {
    const seq = generateArpSequence(TRIAD, 'down', 6);
    expect(seq).toEqual(['G3', 'E3', 'C3', 'G3', 'E3', 'C3']);
  });

  it('updown bounces without repeating endpoints', () => {
    const seq = generateArpSequence(TRIAD, 'updown', 8);
    // [C, E, G, E, C, E, G, E] — no double G or double C at turn
    expect(seq[0]).toBe('C3');
    expect(seq[2]).toBe('G3');
    expect(seq[3]).toBe('E3'); // not G again
  });

  it('thirds skips every other note', () => {
    const seq = generateArpSequence(NOTES, 'thirds', 6);
    // First: C, E, G (evens), then D, F, A (odds)
    expect(seq[0]).toBe('C3');
    expect(seq[1]).toBe('E3');
    expect(seq[2]).toBe('G3');
    expect(seq[3]).toBe('D3');
  });

  it('alberti produces low-high-mid-high pattern', () => {
    const seq = generateArpSequence(TRIAD, 'alberti', 8);
    expect(seq[0]).toBe('C3'); // low
    expect(seq[1]).toBe('G3'); // high
    expect(seq[2]).toBe('E3'); // mid
    expect(seq[3]).toBe('G3'); // high
    // Cycle repeats
    expect(seq[4]).toBe('C3');
  });

  it('pedal alternates root with ascending', () => {
    const seq = generateArpSequence(TRIAD, 'pedal', 6);
    expect(seq[0]).toBe('C3'); // pedal
    expect(seq[1]).toBe('E3'); // moving
    expect(seq[2]).toBe('C3'); // pedal
    expect(seq[3]).toBe('G3'); // moving
    expect(seq[4]).toBe('C3'); // pedal
  });

  it('zigzag creates wave motion', () => {
    const seq = generateArpSequence(NOTES, 'zigzag', 8);
    expect(seq[0]).toBe('C3');
    expect(seq[1]).toBe('D3');
    // Should show back-and-forth motion
    const indices = seq.map(n => NOTES.indexOf(n));
    // Check that there's at least one direction reversal
    let reversals = 0;
    for (let i = 2; i < indices.length; i++) {
      const prev = indices[i - 1] - indices[i - 2];
      const curr = indices[i] - indices[i - 1];
      if (prev > 0 && curr < 0 || prev < 0 && curr > 0) reversals++;
    }
    expect(reversals).toBeGreaterThan(0);
  });

  it('mirror includes endpoints twice', () => {
    const seq = generateArpSequence(TRIAD, 'mirror', 6);
    // [C, E, G, G, E, C]
    expect(seq[0]).toBe('C3');
    expect(seq[2]).toBe('G3');
    expect(seq[3]).toBe('G3'); // endpoint repeated
    expect(seq[5]).toBe('C3');
  });

  it('scatter creates wide intervals', () => {
    const seq = generateArpSequence(NOTES, 'scatter', 6);
    // Should use all notes (no duplicates in first cycle)
    const uniqueNotes = new Set(seq);
    expect(uniqueNotes.size).toBe(6);
    // First two notes should NOT be adjacent
    const idx0 = NOTES.indexOf(seq[0]);
    const idx1 = NOTES.indexOf(seq[1]);
    expect(Math.abs(idx1 - idx0)).toBeGreaterThan(1);
  });

  it('handles single note', () => {
    const seq = generateArpSequence(['C3'], 'alberti', 4);
    expect(seq).toEqual(['C3', 'C3', 'C3', 'C3']);
  });

  it('handles empty notes', () => {
    const seq = generateArpSequence([], 'up', 4);
    expect(seq).toEqual([]);
  });

  it('all styles produce requested length', () => {
    const styles = ['up', 'down', 'updown', 'broken', 'thirds', 'alberti', 'pedal', 'zigzag', 'mirror', 'scatter'] as const;
    for (const style of styles) {
      const seq = generateArpSequence(NOTES, style, 12);
      expect(seq.length).toBe(12);
    }
  });
});

describe('moodArpStyles', () => {
  it('returns array of valid styles', () => {
    const validStyles = ['up', 'down', 'updown', 'broken', 'thirds', 'alberti', 'pedal', 'zigzag', 'mirror', 'scatter'];
    const styles = moodArpStyles('downtempo', 'groove');
    for (const s of styles) {
      expect(validStyles).toContain(s);
    }
  });

  it('ambient favors pedal patterns', () => {
    const styles = moodArpStyles('ambient', 'groove');
    expect(styles).toContain('pedal');
  });

  it('syro favors scatter/broken', () => {
    const styles = moodArpStyles('syro', 'groove');
    expect(styles).toContain('scatter');
    expect(styles).toContain('broken');
  });

  it('build section adds zigzag for momentum', () => {
    const styles = moodArpStyles('ambient', 'build');
    expect(styles).toContain('zigzag');
  });

  it('breakdown section adds pedal for space', () => {
    const styles = moodArpStyles('trance', 'breakdown');
    expect(styles).toContain('pedal');
  });

  it('returns non-empty for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(moodArpStyles(mood, 'groove').length).toBeGreaterThan(0);
    }
  });
});
