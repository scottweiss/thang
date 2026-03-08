import { describe, it, expect } from 'vitest';
import {
  anticipationProbability,
  anticipationTones,
  anticipationBias,
  shouldAnticipate,
  anticipationStrength,
} from './harmonic-anticipation';
import type { ChordState } from '../types';

const Cmaj: ChordState = {
  symbol: 'Cmaj',
  root: 'C',
  quality: 'maj',
  notes: ['C3', 'E3', 'G3'],
  degree: 1,
};

const Dmin7: ChordState = {
  symbol: 'Dmin7',
  root: 'D',
  quality: 'min7',
  notes: ['D3', 'F3', 'A3', 'C4'],
  degree: 2,
};

const Gmaj: ChordState = {
  symbol: 'Gmaj',
  root: 'G',
  quality: 'maj',
  notes: ['G3', 'B3', 'D4'],
  degree: 5,
};

describe('anticipationProbability', () => {
  it('returns 0 when far from chord change', () => {
    expect(anticipationProbability(0, 8, 'lofi', 'groove')).toBe(0);
  });

  it('increases near chord change', () => {
    const far = anticipationProbability(4, 8, 'lofi', 'groove');
    const near = anticipationProbability(7, 8, 'lofi', 'groove');
    expect(near).toBeGreaterThan(far);
  });

  it('returns 0 when past chord duration', () => {
    expect(anticipationProbability(10, 8, 'lofi', 'groove')).toBe(0);
  });

  it('lofi has higher probability than trance', () => {
    const lofi = anticipationProbability(7, 8, 'lofi', 'groove');
    const trance = anticipationProbability(7, 8, 'trance', 'groove');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('build section amplifies anticipation', () => {
    const groove = anticipationProbability(7, 8, 'lofi', 'groove');
    const build = anticipationProbability(7, 8, 'lofi', 'build');
    expect(build).toBeGreaterThan(groove);
  });

  it('stays within 0-1', () => {
    const prob = anticipationProbability(7, 8, 'lofi', 'build');
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });
});

describe('anticipationTones', () => {
  it('finds notes in next chord not in current', () => {
    const tones = anticipationTones(Cmaj, Dmin7);
    // D, F, A are in Dmin7 but not Cmaj (C is shared)
    expect(tones).toContain('D');
    expect(tones).toContain('F');
    expect(tones).toContain('A');
    expect(tones).not.toContain('C');
  });

  it('returns empty when chords share all notes', () => {
    const tones = anticipationTones(Cmaj, Cmaj);
    expect(tones).toHaveLength(0);
  });

  it('strips octave from note names', () => {
    const tones = anticipationTones(Cmaj, Gmaj);
    // B and D are anticipation tones (G is shared)
    expect(tones).toContain('B');
    expect(tones).toContain('D');
    expect(tones.every(t => !/[0-9]/.test(t))).toBe(true);
  });
});

describe('anticipationBias', () => {
  it('returns 1.0 when no anticipation tones', () => {
    expect(anticipationBias('D', [], 0.5)).toBe(1.0);
  });

  it('returns 1.0 when probability is 0', () => {
    expect(anticipationBias('D', ['D', 'F'], 0)).toBe(1.0);
  });

  it('boosts matching anticipation tone', () => {
    const bias = anticipationBias('D', ['D', 'F'], 0.5);
    expect(bias).toBeGreaterThan(1.0);
  });

  it('no boost for non-matching note', () => {
    const bias = anticipationBias('C', ['D', 'F'], 0.5);
    expect(bias).toBe(1.0);
  });

  it('higher probability means stronger bias', () => {
    const low = anticipationBias('D', ['D'], 0.2);
    const high = anticipationBias('D', ['D'], 0.8);
    expect(high).toBeGreaterThan(low);
  });
});

describe('shouldAnticipate', () => {
  it('returns true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    moods.forEach(m => expect(shouldAnticipate(m)).toBe(true));
  });
});

describe('anticipationStrength', () => {
  it('lofi has strongest anticipation', () => {
    expect(anticipationStrength('lofi')).toBe(0.50);
  });

  it('trance has weakest anticipation', () => {
    expect(anticipationStrength('trance')).toBe(0.10);
  });
});
