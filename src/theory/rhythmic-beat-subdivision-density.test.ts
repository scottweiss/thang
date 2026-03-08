import { describe, it, expect } from 'vitest';
import {
  subdivisionLevel,
  beatSubdivisionGain,
  subdivStrengthValue,
} from './rhythmic-beat-subdivision-density';

describe('subdivisionLevel', () => {
  it('positions 0,4,8,12 are quarter notes', () => {
    expect(subdivisionLevel(0)).toBe('quarter');
    expect(subdivisionLevel(4)).toBe('quarter');
    expect(subdivisionLevel(8)).toBe('quarter');
    expect(subdivisionLevel(12)).toBe('quarter');
  });

  it('positions 2,6,10,14 are eighth notes', () => {
    expect(subdivisionLevel(2)).toBe('eighth');
    expect(subdivisionLevel(6)).toBe('eighth');
    expect(subdivisionLevel(10)).toBe('eighth');
    expect(subdivisionLevel(14)).toBe('eighth');
  });

  it('odd positions are sixteenth notes', () => {
    expect(subdivisionLevel(1)).toBe('sixteenth');
    expect(subdivisionLevel(3)).toBe('sixteenth');
    expect(subdivisionLevel(7)).toBe('sixteenth');
    expect(subdivisionLevel(15)).toBe('sixteenth');
  });

  it('negative positions normalize', () => {
    expect(subdivisionLevel(-4)).toBe('quarter');
  });
});

describe('beatSubdivisionGain', () => {
  it('quarter notes are neutral', () => {
    expect(beatSubdivisionGain(0, 'syro', 'peak')).toBe(1.0);
    expect(beatSubdivisionGain(4, 'syro', 'peak')).toBe(1.0);
  });

  it('sixteenth notes get boost in high-energy context', () => {
    const gain = beatSubdivisionGain(1, 'syro', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('sixteenth boost > eighth boost', () => {
    const sixteenth = beatSubdivisionGain(1, 'syro', 'peak');
    const eighth = beatSubdivisionGain(2, 'syro', 'peak');
    expect(sixteenth).toBeGreaterThan(eighth);
  });

  it('syro boosts more than ambient', () => {
    const syro = beatSubdivisionGain(1, 'syro', 'peak');
    const amb = beatSubdivisionGain(1, 'ambient', 'peak');
    expect(syro).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = beatSubdivisionGain(p, 'syro', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('subdivStrengthValue', () => {
  it('syro is highest', () => {
    expect(subdivStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(subdivStrengthValue('ambient')).toBe(0.10);
  });
});
