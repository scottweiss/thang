import { describe, it, expect } from 'vitest';
import { addOrnaments, getOrnamentAmount } from './ornamentation';

describe('addOrnaments', () => {
  const ladder = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  it('returns same length array', () => {
    const elements = ['~', 'E4', '~', 'G4', '~', '~', '~', '~'];
    const result = addOrnaments(elements, ladder, 'lofi', 0.8);
    expect(result).toHaveLength(elements.length);
  });

  it('does not add ornaments for ambient', () => {
    const elements = ['~', 'E4', '~', 'G4', '~', '~', '~', '~'];
    const result = addOrnaments(elements, ladder, 'ambient', 1.0);
    expect(result).toEqual(elements);
  });

  it('preserves active notes', () => {
    const elements = ['~', 'E4', '~', 'G4', '~', '~', '~', '~'];
    const result = addOrnaments(elements, ladder, 'syro', 0.9);
    // E4 and G4 should still be in their positions
    expect(result[1]).toBe('E4');
    expect(result[3]).toBe('G4');
  });

  it('only fills rests before notes', () => {
    const elements = ['E4', '~', '~', 'G4', '~', '~', '~', '~'];
    const result = addOrnaments(elements, ladder, 'syro', 1.0);
    // Position 0 is already a note, shouldn't change
    expect(result[0]).toBe('E4');
  });

  it('with high tension and syro, some ornaments appear', () => {
    const elements = ['~', 'E4', '~', 'G4', '~', 'C5', '~', '~'];
    let ornamentCount = 0;
    for (let i = 0; i < 100; i++) {
      const result = addOrnaments(elements, ladder, 'syro', 1.0);
      const origRests = elements.filter(e => e === '~').length;
      const newRests = result.filter(e => e === '~').length;
      if (newRests < origRests) ornamentCount++;
    }
    expect(ornamentCount).toBeGreaterThan(10);
  });

  it('enclosure uses 2 rest slots when available', () => {
    // Syro and blockhead have enclosure in their weights
    const elements = ['~', '~', 'E4', '~', '~', 'G4', '~', '~'];
    let doubleOrnament = false;
    for (let i = 0; i < 200; i++) {
      const result = addOrnaments(elements, ladder, 'blockhead', 1.0);
      // Check if positions i-2 and i-1 before a note are both filled
      if (result[0] !== '~' && result[1] !== '~') {
        doubleOrnament = true;
        break;
      }
      if (result[3] !== '~' && result[4] !== '~') {
        doubleOrnament = true;
        break;
      }
    }
    expect(doubleOrnament).toBe(true);
  });

  it('ornaments use notes from the ladder or chromatic variants', () => {
    const elements = ['~', 'E4', '~', 'G4', '~', '~', '~', '~'];
    for (let i = 0; i < 50; i++) {
      const result = addOrnaments(elements, ladder, 'syro', 1.0);
      for (const note of result) {
        if (note !== '~') {
          // Should be either a ladder note or have a valid note format
          expect(note).toMatch(/^[A-G][#b]?\d$/);
        }
      }
    }
  });
});

describe('getOrnamentAmount', () => {
  it('ambient has zero', () => {
    expect(getOrnamentAmount('ambient')).toBe(0);
  });

  it('syro has the most', () => {
    const syro = getOrnamentAmount('syro');
    const all = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                 'xtal', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of all) {
      expect(syro).toBeGreaterThanOrEqual(getOrnamentAmount(mood));
    }
  });
});
