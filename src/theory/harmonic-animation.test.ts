import { describe, it, expect } from 'vitest';
import {
  animateChordVoicing,
  findScaleNeighbor,
  voicingsToPattern,
  animationProbability,
} from './harmonic-animation';

describe('findScaleNeighbor', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('finds upper neighbor for E3 in C major', () => {
    const neighbor = findScaleNeighbor('E3', cMajor);
    expect(neighbor).toBe('F3');
  });

  it('finds scale neighbor for G3 in C major (A3 or F3)', () => {
    const neighbor = findScaleNeighbor('G3', cMajor);
    expect(['A3', 'F3']).toContain(neighbor);
  });

  it('finds upper neighbor for B3 (crosses octave)', () => {
    const neighbor = findScaleNeighbor('B3', cMajor);
    expect(neighbor).toBe('C4');
  });

  it('returns null for invalid note', () => {
    expect(findScaleNeighbor('invalid', cMajor)).toBeNull();
  });
});

describe('animateChordVoicing', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('returns correct number of steps', () => {
    const voicings = animateChordVoicing(['C3', 'E3', 'G3'], cMajor, 8);
    expect(voicings).toHaveLength(8);
  });

  it('each voicing has same length as input', () => {
    const voicings = animateChordVoicing(['C3', 'E3', 'G3', 'B3'], cMajor, 4);
    voicings.forEach(v => expect(v).toHaveLength(4));
  });

  it('root note stays the same across all voicings', () => {
    const voicings = animateChordVoicing(['C3', 'E3', 'G3'], cMajor, 8);
    voicings.forEach(v => expect(v[0]).toBe('C3'));
  });

  it('top note stays the same across all voicings', () => {
    const chord = ['C3', 'E3', 'G3'];
    const voicings = animateChordVoicing(chord, cMajor, 8);
    voicings.forEach(v => expect(v[v.length - 1]).toBe('G3'));
  });

  it('handles 2-note chords gracefully', () => {
    const voicings = animateChordVoicing(['C3', 'G3'], cMajor, 4);
    expect(voicings).toHaveLength(4);
  });

  it('handles 1 step', () => {
    const voicings = animateChordVoicing(['C3', 'E3', 'G3'], cMajor, 1);
    expect(voicings).toHaveLength(1);
  });
});

describe('voicingsToPattern', () => {
  it('wraps each voicing in brackets', () => {
    const voicings = [['C3', 'E3', 'G3'], ['C3', 'F3', 'G3']];
    const pattern = voicingsToPattern(voicings);
    expect(pattern).toBe('[C3,E3,G3] [C3,F3,G3]');
  });
});

describe('animationProbability', () => {
  it('lofi has highest probability', () => {
    const lofi = animationProbability('lofi', 'groove');
    const trance = animationProbability('trance', 'groove');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('ambient has zero probability', () => {
    expect(animationProbability('ambient', 'groove')).toBe(0);
  });

  it('groove section boosts probability', () => {
    const groove = animationProbability('lofi', 'groove');
    const peak = animationProbability('lofi', 'peak');
    expect(groove).toBeGreaterThan(peak);
  });

  it('never exceeds 0.5', () => {
    expect(animationProbability('lofi', 'groove')).toBeLessThanOrEqual(0.5);
  });
});
