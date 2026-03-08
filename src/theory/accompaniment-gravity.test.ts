import { describe, it, expect } from 'vitest';
import {
  accompGravityPull,
  nextChordBlend,
  blendVoicings,
  shouldApplyAccompGravity,
  accompGravityStrength,
} from './accompaniment-gravity';

describe('accompGravityPull', () => {
  it('returns 0 when far from chord change', () => {
    expect(accompGravityPull(0, 8, 'lofi', 'groove')).toBe(0);
  });

  it('increases near chord change', () => {
    const far = accompGravityPull(4, 8, 'lofi', 'groove');
    const near = accompGravityPull(7, 8, 'lofi', 'groove');
    expect(near).toBeGreaterThan(far);
  });

  it('returns 0 past chord duration', () => {
    expect(accompGravityPull(10, 8, 'lofi', 'groove')).toBe(0);
  });

  it('lofi has stronger pull than trance', () => {
    const lofi = accompGravityPull(7, 8, 'lofi', 'groove');
    const trance = accompGravityPull(7, 8, 'trance', 'groove');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('build section amplifies pull', () => {
    const groove = accompGravityPull(7, 8, 'lofi', 'groove');
    const build = accompGravityPull(7, 8, 'lofi', 'build');
    expect(build).toBeGreaterThan(groove);
  });

  it('stays within 0-1', () => {
    expect(accompGravityPull(7, 8, 'lofi', 'build')).toBeLessThanOrEqual(1);
    expect(accompGravityPull(7, 8, 'lofi', 'build')).toBeGreaterThanOrEqual(0);
  });
});

describe('nextChordBlend', () => {
  it('returns 0 for no pull', () => {
    expect(nextChordBlend(0)).toBe(0);
  });

  it('returns less than 1 even at full pull', () => {
    expect(nextChordBlend(1.0)).toBeLessThan(1.0);
  });

  it('exponential: small pull = very small blend', () => {
    expect(nextChordBlend(0.2)).toBeLessThan(0.05);
  });
});

describe('blendVoicings', () => {
  it('returns current notes when blend is 0', () => {
    const result = blendVoicings(['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], 0);
    expect(result).toEqual(['C3', 'E3', 'G3']);
  });

  it('replaces some notes at moderate blend', () => {
    const result = blendVoicings(['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], 0.5);
    // At least one note should be from next chord
    const nextPCs = ['D', 'F', 'A'];
    const hasNextNote = result.some(n => nextPCs.includes(n.replace(/[0-9]/g, '')));
    expect(hasNextNote).toBe(true);
  });

  it('handles empty inputs', () => {
    expect(blendVoicings([], ['D3'], 0.5)).toEqual(['D3']);
    expect(blendVoicings(['C3'], [], 0.5)).toEqual(['C3']);
  });

  it('keeps shared notes intact', () => {
    // G is shared between Cmaj and Gmaj
    const result = blendVoicings(['C3', 'E3', 'G3'], ['G3', 'B3', 'D4'], 0.3);
    // G should still be present (it's in both chords)
    expect(result.some(n => n.replace(/[0-9]/g, '') === 'G')).toBe(true);
  });
});

describe('shouldApplyAccompGravity', () => {
  it('returns true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    moods.forEach(m => expect(shouldApplyAccompGravity(m)).toBe(true));
  });
});

describe('accompGravityStrength', () => {
  it('lofi has strongest gravity', () => {
    expect(accompGravityStrength('lofi')).toBe(0.50);
  });

  it('trance has weakest gravity', () => {
    expect(accompGravityStrength('trance')).toBe(0.10);
  });
});
