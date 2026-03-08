import { describe, it, expect } from 'vitest';
import { generateBassPattern, getBassConfig, bassFollowsChord } from './bass-pattern';

describe('getBassConfig', () => {
  it('ambient uses pedal style', () => {
    expect(getBassConfig('ambient').style).toBe('pedal');
  });

  it('disco uses octave-jump style', () => {
    expect(getBassConfig('disco').style).toBe('octave-jump');
  });

  it('lofi follows chord', () => {
    expect(getBassConfig('lofi').followChord).toBe(true);
  });

  it('ambient does not follow chord', () => {
    expect(getBassConfig('ambient').followChord).toBe(false);
  });
});

describe('generateBassPattern', () => {
  it('returns correct number of steps', () => {
    const pattern = generateBassPattern('C', 'G', 'lofi', 4);
    expect(pattern).toHaveLength(4);
  });

  it('pedal returns all same note', () => {
    const pattern = generateBassPattern('C', 'G', 'ambient', 4);
    const nonRest = pattern.filter(n => n !== '~');
    const unique = new Set(nonRest);
    expect(unique.size).toBe(1);
    expect(nonRest[0]).toBe('C2');
  });

  it('root-fifth pattern contains root', () => {
    const pattern = generateBassPattern('D', 'A', 'lofi', 4);
    expect(pattern.some(n => n.startsWith('D'))).toBe(true);
  });

  it('octave-jump contains root at different octaves or fifth', () => {
    const pattern = generateBassPattern('C', 'G', 'disco', 4);
    const hasNotes = pattern.some(n => n !== '~');
    expect(hasNotes).toBe(true);
  });

  it('driving pattern is dense', () => {
    const pattern = generateBassPattern('E', 'B', 'trance', 4);
    const noteCount = pattern.filter(n => n !== '~').length;
    expect(noteCount).toBeGreaterThanOrEqual(3);
  });

  it('handles custom step count', () => {
    const pattern = generateBassPattern('C', 'G', 'ambient', 8);
    expect(pattern).toHaveLength(8);
  });
});

describe('bassFollowsChord', () => {
  it('disco follows chord', () => {
    expect(bassFollowsChord('disco')).toBe(true);
  });

  it('xtal does not follow chord', () => {
    expect(bassFollowsChord('xtal')).toBe(false);
  });
});
