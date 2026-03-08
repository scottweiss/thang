import { describe, it, expect } from 'vitest';
import {
  secondaryDominantRoot,
  secondaryDominantNotes,
  secondaryDominantProbability,
  secondaryDominantSymbol,
} from './secondary-dominant';

describe('secondaryDominantRoot', () => {
  it('V/V in C = D (P5 above G)', () => {
    // Target is G (degree V in C), secondary dominant root = D
    expect(secondaryDominantRoot('G')).toBe('D');
  });

  it('V/ii in C = A (P5 above D)', () => {
    expect(secondaryDominantRoot('D')).toBe('A');
  });

  it('V/IV in C = G (P5 above C... wait no, V/IV = C itself)', () => {
    // V/IV in C major: target is F, so V/F = C
    expect(secondaryDominantRoot('F')).toBe('C');
  });

  it('V/vi in C = E (P5 above A)', () => {
    expect(secondaryDominantRoot('A')).toBe('E');
  });

  it('handles sharps', () => {
    expect(secondaryDominantRoot('F#')).toBe('C#');
  });
});

describe('secondaryDominantNotes', () => {
  it('returns 4 notes (dom7 chord)', () => {
    const notes = secondaryDominantNotes('G', 3);
    expect(notes).toHaveLength(4);
  });

  it('V/V in C = D7 chord', () => {
    const notes = secondaryDominantNotes('G', 3);
    // D7 = D, F#, A, C
    expect(notes[0]).toBe('D3');
    expect(notes[1]).toBe('F#3');
    expect(notes[2]).toBe('A3');
    expect(notes[3]).toBe('C4');
  });
});

describe('secondaryDominantProbability', () => {
  it('returns 0 for degree 0 (tonic)', () => {
    expect(secondaryDominantProbability(0, 'lofi', 'groove', 0.5)).toBe(0);
  });

  it('ambient never gets secondary dominants', () => {
    expect(secondaryDominantProbability(4, 'ambient', 'groove', 0.5)).toBe(0);
  });

  it('lofi has highest probability', () => {
    const lofi = secondaryDominantProbability(4, 'lofi', 'groove', 0.5);
    const trance = secondaryDominantProbability(4, 'trance', 'groove', 0.5);
    expect(lofi).toBeGreaterThan(trance);
  });

  it('V/V (degree 4→5) has strongest target', () => {
    const toV = secondaryDominantProbability(4, 'lofi', 'groove', 0.5);
    const toVii = secondaryDominantProbability(6, 'lofi', 'groove', 0.5);
    expect(toV).toBeGreaterThan(toVii);
  });

  it('groove section boosts probability', () => {
    const groove = secondaryDominantProbability(4, 'lofi', 'groove', 0.5);
    const intro = secondaryDominantProbability(4, 'lofi', 'intro', 0.5);
    expect(groove).toBeGreaterThan(intro);
  });

  it('later in section has higher probability', () => {
    const early = secondaryDominantProbability(4, 'lofi', 'groove', 0.1);
    const late = secondaryDominantProbability(4, 'lofi', 'groove', 0.9);
    expect(late).toBeGreaterThan(early);
  });

  it('never exceeds 0.3', () => {
    const prob = secondaryDominantProbability(4, 'lofi', 'groove', 1.0);
    expect(prob).toBeLessThanOrEqual(0.3);
  });
});

describe('secondaryDominantSymbol', () => {
  it('returns dom7 symbol', () => {
    expect(secondaryDominantSymbol('G')).toBe('D7');
    expect(secondaryDominantSymbol('A')).toBe('E7');
    expect(secondaryDominantSymbol('F')).toBe('C7');
  });
});
