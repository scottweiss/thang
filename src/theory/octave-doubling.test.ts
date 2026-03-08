import { describe, it, expect } from 'vitest';
import { addOctaveDoublings } from './octave-doubling';

describe('addOctaveDoublings', () => {
  it('does not modify at low tension', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C4', '~',
                      'D4', '~', 'F4', '~', 'A4', '~', 'D4', '~'];
    const result = addOctaveDoublings(elements, 0.3, 'peak', 'trance');
    expect(result).toEqual(elements);
  });

  it('does not modify during breakdown', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C4', '~',
                      'D4', '~', 'F4', '~', 'A4', '~', 'D4', '~'];
    const result = addOctaveDoublings(elements, 0.9, 'breakdown', 'trance');
    expect(result).toEqual(elements);
  });

  it('does not modify for ambient mood', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C4', '~',
                      'D4', '~', 'F4', '~', 'A4', '~', 'D4', '~'];
    const result = addOctaveDoublings(elements, 0.9, 'peak', 'ambient');
    expect(result).toEqual(elements);
  });

  it('eventually produces doublings at high tension peak for trance', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C4', '~',
                      'D4', '~', 'F4', '~', 'A4', '~', 'D4', '~'];
    let foundDoubling = false;
    for (let i = 0; i < 100; i++) {
      const result = addOctaveDoublings(elements, 0.95, 'peak', 'trance');
      if (result.some(s => s.includes(','))) {
        foundDoubling = true;
        break;
      }
    }
    expect(foundDoubling).toBe(true);
  });

  it('doubling contains octave-up note', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C4', '~',
                      'D4', '~', 'F4', '~', 'A4', '~', 'D4', '~'];
    for (let i = 0; i < 100; i++) {
      const result = addOctaveDoublings(elements, 0.95, 'peak', 'trance');
      const doubled = result.find(s => s.includes(','));
      if (doubled) {
        expect(doubled).toMatch(/\[.*5\]/); // should contain octave 5
        break;
      }
    }
  });

  it('only doubles on strong beats', () => {
    const elements = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5',
                      'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'];
    for (let i = 0; i < 50; i++) {
      const result = addOctaveDoublings(elements, 0.95, 'peak', 'trance');
      for (let j = 0; j < result.length; j++) {
        if (result[j].includes(',')) {
          expect(j % 4).toBe(0); // strong beats only
        }
      }
    }
  });

  it('does not double notes at octave 6+', () => {
    const elements = ['C6', '~', '~', '~', 'C6', '~', '~', '~',
                      'C6', '~', '~', '~', 'C6', '~', '~', '~'];
    for (let i = 0; i < 50; i++) {
      const result = addOctaveDoublings(elements, 0.95, 'peak', 'trance');
      // No doublings should appear (octave 7 would be too high)
      expect(result.some(s => s.includes(','))).toBe(false);
    }
  });

  it('preserves rests', () => {
    const elements = ['~', '~', '~', '~', '~', '~', '~', '~',
                      '~', '~', '~', '~', '~', '~', '~', '~'];
    const result = addOctaveDoublings(elements, 0.95, 'peak', 'trance');
    expect(result).toEqual(elements);
  });
});
