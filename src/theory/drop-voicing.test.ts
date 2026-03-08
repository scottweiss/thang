import { describe, it, expect } from 'vitest';
import {
  applyDrop2,
  applyDrop3,
  pickDropVoicing,
  dropProbability,
} from './drop-voicing';

describe('applyDrop2', () => {
  it('drops second-from-top voice down an octave', () => {
    const result = applyDrop2(['C4', 'E4', 'G4', 'B4']);
    // G4 is second from top → G3
    expect(result).toContain('G3');
    expect(result).not.toContain('G4');
  });

  it('returns sorted result', () => {
    const result = applyDrop2(['C4', 'E4', 'G4', 'B4']);
    // After dropping G4→G3, order should be G3 C4 E4 B4
    expect(result).toEqual(['G3', 'C4', 'E4', 'B4']);
  });

  it('passes through 2-note chords unchanged', () => {
    const result = applyDrop2(['C4', 'G4']);
    expect(result).toEqual(['C4', 'G4']);
  });

  it('works with 3-note chords (triad)', () => {
    const result = applyDrop2(['C4', 'E4', 'G4']);
    // E4 is second from top → E3
    expect(result).toContain('E3');
    expect(result).toEqual(['E3', 'C4', 'G4']);
  });

  it('handles accidentals', () => {
    const result = applyDrop2(['C4', 'Eb4', 'G4', 'Bb4']);
    // G4 → G3
    expect(result).toContain('G3');
  });

  it('does not drop below octave 1', () => {
    const result = applyDrop2(['C1', 'E1', 'G1']);
    // E1 would become E0 which is out of range — should stay unchanged
    expect(result).toEqual(['C1', 'E1', 'G1']);
  });
});

describe('applyDrop3', () => {
  it('drops third-from-top voice down an octave', () => {
    const result = applyDrop3(['C4', 'E4', 'G4', 'B4']);
    // E4 is third from top → E3
    expect(result).toContain('E3');
    expect(result).not.toContain('E4');
  });

  it('falls back to drop-2 for 3-note chords', () => {
    const triad = ['C4', 'E4', 'G4'];
    const drop3Result = applyDrop3(triad);
    const drop2Result = applyDrop2(triad);
    expect(drop3Result).toEqual(drop2Result);
  });

  it('returns sorted result for 4-note chord', () => {
    const result = applyDrop3(['C4', 'E4', 'G4', 'B4']);
    // E4→E3, sorted: E3 C4 G4 B4
    expect(result).toEqual(['E3', 'C4', 'G4', 'B4']);
  });
});

describe('pickDropVoicing', () => {
  it('returns close for 2-note chords', () => {
    expect(pickDropVoicing('lofi', 'groove', 2)).toBe('close');
  });

  it('returns a valid voicing type', () => {
    const result = pickDropVoicing('lofi', 'groove', 4);
    expect(['drop2', 'drop3', 'close']).toContain(result);
  });

  it('never returns drop3 for 3-note chords', () => {
    // Run many times to ensure drop3 never appears for triads
    for (let i = 0; i < 100; i++) {
      const result = pickDropVoicing('lofi', 'groove', 3);
      expect(result).not.toBe('drop3');
    }
  });
});

describe('dropProbability', () => {
  it('lofi groove has highest probability', () => {
    const lofiGroove = dropProbability('lofi', 'groove');
    const tranceIntro = dropProbability('trance', 'intro');
    expect(lofiGroove).toBeGreaterThan(tranceIntro);
  });

  it('breakdown reduces probability', () => {
    const groove = dropProbability('lofi', 'groove');
    const breakdown = dropProbability('lofi', 'breakdown');
    expect(breakdown).toBeLessThan(groove);
  });

  it('is deterministic', () => {
    const a = dropProbability('downtempo', 'peak');
    const b = dropProbability('downtempo', 'peak');
    expect(a).toBe(b);
  });
});
