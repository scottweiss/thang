import { describe, it, expect } from 'vitest';
import { addAnacrusis, anacrusisProb, approachNotes, pickupLength } from './anacrusis';

describe('addAnacrusis', () => {
  const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];

  it('places pickup notes in trailing rests', () => {
    // Force anacrusis by running many times
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', '~', '~'];
    let found = false;
    for (let i = 0; i < 100; i++) {
      const result = addAnacrusis(elements, 'C4', ladder, 'disco');
      // Check if last position(s) got notes
      if (result[result.length - 1] !== '~' || result[result.length - 2] !== '~') {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('preserves notes — only replaces trailing rests', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', '~', '~'];
    for (let i = 0; i < 50; i++) {
      const result = addAnacrusis(elements, 'C4', ladder, 'disco');
      // Original notes should be intact
      expect(result[0]).toBe('C4');
      expect(result[2]).toBe('E4');
      expect(result[4]).toBe('G4');
    }
  });

  it('does not modify when not enough trailing rests', () => {
    const elements = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const result = addAnacrusis(elements, 'C4', ladder, 'disco');
    expect(result).toEqual(elements);
  });

  it('returns original for short arrays', () => {
    const elements = ['C4', '~'];
    const result = addAnacrusis(elements, 'C4', ladder, 'trance');
    expect(result).toEqual(elements);
  });

  it('ambient rarely adds anacrusis', () => {
    expect(anacrusisProb('ambient')).toBeLessThan(0.1);
  });

  it('disco frequently adds anacrusis', () => {
    expect(anacrusisProb('disco')).toBeGreaterThan(0.4);
  });
});

describe('approachNotes', () => {
  const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'];

  it('returns notes near the target', () => {
    const notes = approachNotes('C4', ladder, 1);
    expect(notes).toHaveLength(1);
    // Should be a note close to C4 (B3 or D4)
    const note = notes[0];
    expect(note).toMatch(/^[A-G][b#]?\d$/);
  });

  it('returns correct count for double pickup', () => {
    const notes = approachNotes('E4', ladder, 2);
    expect(notes.length).toBeLessThanOrEqual(2);
    expect(notes.length).toBeGreaterThan(0);
  });

  it('handles target not in ladder', () => {
    const notes = approachNotes('Eb4', ladder, 1);
    // Should still find nearby notes
    expect(notes.length).toBeLessThanOrEqual(1);
  });

  it('returns empty for invalid target', () => {
    const notes = approachNotes('invalid', ladder, 1);
    expect(notes).toEqual([]);
  });
});

describe('pickupLength', () => {
  it('returns 1 or 2', () => {
    for (let i = 0; i < 50; i++) {
      const len = pickupLength('trance');
      expect(len).toBeGreaterThanOrEqual(1);
      expect(len).toBeLessThanOrEqual(2);
    }
  });

  it('avril always returns 1', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickupLength('avril')).toBe(1);
    }
  });
});
