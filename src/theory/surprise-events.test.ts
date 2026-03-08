import { describe, it, expect } from 'vitest';
import {
  rollSurprise,
  surpriseProbability,
  applyOctaveLeap,
  applyRegisterShift,
  brightnessFlashMultiplier,
} from './surprise-events';

describe('surpriseProbability', () => {
  it('flim has highest rate', () => {
    const flim = surpriseProbability('flim', 'groove');
    const trance = surpriseProbability('trance', 'groove');
    expect(flim).toBeGreaterThan(trance);
  });

  it('breakdown boosts probability', () => {
    const breakdown = surpriseProbability('lofi', 'breakdown');
    const intro = surpriseProbability('lofi', 'intro');
    expect(breakdown).toBeGreaterThan(intro);
  });

  it('stays under 10%', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        expect(surpriseProbability(mood, section)).toBeLessThan(0.10);
      }
    }
  });
});

describe('rollSurprise', () => {
  it('returns none when cooldown is active', () => {
    // With only 3 ticks since last surprise, should always be 'none'
    for (let i = 0; i < 50; i++) {
      expect(rollSurprise('flim', 'breakdown', 3)).toBe('none');
    }
  });

  it('eventually returns a surprise with high-rate mood', () => {
    let foundSurprise = false;
    for (let i = 0; i < 200; i++) {
      if (rollSurprise('flim', 'breakdown', 20) !== 'none') {
        foundSurprise = true;
        break;
      }
    }
    expect(foundSurprise).toBe(true);
  });
});

describe('applyOctaveLeap', () => {
  it('shifts one note up an octave', () => {
    const result = applyOctaveLeap('C3 ~ E3 G3 ~ A3 B3 ~');
    // At least one note should have octave 4
    expect(result).toMatch(/[A-G][b#]?4/);
  });

  it('does not shift already-high notes', () => {
    const result = applyOctaveLeap('~ ~ ~ C6 ~ D6 E6 ~');
    // Octave 6 should not become 7
    expect(result).not.toMatch(/[A-G][b#]?7/);
  });

  it('handles all rests gracefully', () => {
    expect(applyOctaveLeap('~ ~ ~ ~')).toBe('~ ~ ~ ~');
  });

  it('preserves note names', () => {
    const result = applyOctaveLeap('C3 D3 E3 F3 G3 A3 B3 C4');
    // All notes should still be valid note names
    const notes = result.split(' ').filter(n => n !== '~');
    notes.forEach(n => expect(n).toMatch(/^[A-G][b#]?\d$/));
  });
});

describe('applyRegisterShift', () => {
  it('shifts all notes up', () => {
    const result = applyRegisterShift('C3 E3 G3', 'up');
    expect(result).toBe('C4 E4 G4');
  });

  it('shifts all notes down', () => {
    const result = applyRegisterShift('C4 E4 G4', 'down');
    expect(result).toBe('C3 E3 G3');
  });

  it('clamps at octave 6 (up) and 2 (down)', () => {
    expect(applyRegisterShift('C6', 'up')).toBe('C6');
    expect(applyRegisterShift('C2', 'down')).toBe('C2');
  });

  it('handles sharps and flats', () => {
    expect(applyRegisterShift('C#3 Bb3', 'up')).toBe('C#4 Bb4');
  });
});

describe('brightnessFlashMultiplier', () => {
  it('returns value > 1', () => {
    expect(brightnessFlashMultiplier()).toBeGreaterThan(1.0);
  });
});
