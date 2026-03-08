import { describe, it, expect } from 'vitest';
import {
  transposeMotif,
  selectEchoInterval,
  echoProbability,
} from './imitative-echo';

describe('transposeMotif', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('transposes up by 2 scale steps (C→E)', () => {
    const result = transposeMotif(['C4', 'E4', 'G4'], cMajor, 2);
    expect(result).toEqual(['E4', 'G4', 'B4']);
  });

  it('transposes down by 3 scale steps (C→G below)', () => {
    const result = transposeMotif(['C4', 'E4'], cMajor, -3);
    // C4 → 3 steps below in C major = G3
    // E4 → 3 steps below = B3
    expect(result).toEqual(['G3', 'B3']);
  });

  it('wraps across octave boundaries going up', () => {
    const result = transposeMotif(['A4', 'B4'], cMajor, 4);
    // A4 + 4 steps = E5 (wraps past B to C5, D5, E5)
    // B4 + 4 steps = F5
    expect(result).toEqual(['E5', 'F5']);
  });

  it('wraps across octave boundaries going down', () => {
    const result = transposeMotif(['C4', 'D4'], cMajor, -2);
    // C4 - 2 steps = A3
    // D4 - 2 steps = B3
    expect(result).toEqual(['A3', 'B3']);
  });

  it('preserves notes not in scale', () => {
    const result = transposeMotif(['C#4'], cMajor, 2);
    expect(result).toEqual(['C#4']); // not in scale, returned as-is
  });

  it('handles rests/non-notes gracefully', () => {
    const result = transposeMotif(['~', 'C4'], cMajor, 1);
    expect(result[0]).toBe('~');
    expect(result[1]).toBe('D4');
  });
});

describe('selectEchoInterval', () => {
  it('rotates through mood intervals', () => {
    const i0 = selectEchoInterval('lofi', 0);
    const i1 = selectEchoInterval('lofi', 1);
    const i2 = selectEchoInterval('lofi', 2);
    expect(i0).toBe(4);  // 5th up
    expect(i1).toBe(-3); // 4th down
    expect(i2).toBe(2);  // 3rd up
  });

  it('wraps around after all intervals used', () => {
    const i0 = selectEchoInterval('lofi', 0);
    const i3 = selectEchoInterval('lofi', 3);
    expect(i0).toBe(i3); // lofi has 3 intervals, so index 3 wraps
  });

  it('syro has unusual intervals', () => {
    const i0 = selectEchoInterval('syro', 0);
    expect(i0).toBe(-4); // 5th down (unusual for echo)
  });
});

describe('echoProbability', () => {
  it('syro is highest', () => {
    expect(echoProbability('syro')).toBe(0.35);
  });

  it('ambient is lowest', () => {
    expect(echoProbability('ambient')).toBe(0.05);
  });

  it('lofi has moderate echo rate', () => {
    expect(echoProbability('lofi')).toBe(0.30);
  });
});
