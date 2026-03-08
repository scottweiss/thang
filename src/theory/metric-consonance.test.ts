import { describe, it, expect } from 'vitest';
import {
  metricWeight,
  chordToneBias,
  chordToneBiasMap,
  isChordTone,
  applyMetricConsonance,
  metricConsonanceStrength,
} from './metric-consonance';

describe('metricWeight', () => {
  it('beat 1 is strongest', () => {
    expect(metricWeight(0)).toBe(1.0);
  });

  it('beat 3 is second strongest', () => {
    expect(metricWeight(8)).toBe(0.85);
  });

  it('beats 2 and 4 are medium', () => {
    expect(metricWeight(4)).toBe(0.7);
    expect(metricWeight(12)).toBe(0.7);
  });

  it('16th positions are weakest', () => {
    expect(metricWeight(1)).toBe(0.2);
    expect(metricWeight(3)).toBe(0.2);
    expect(metricWeight(7)).toBe(0.2);
  });

  it('wraps around for positions > 15', () => {
    expect(metricWeight(16)).toBe(metricWeight(0));
  });
});

describe('chordToneBias', () => {
  it('strong beat + strict mood = high bias', () => {
    const bias = chordToneBias(0, 'trance');
    expect(bias).toBeGreaterThan(1.2);
  });

  it('weak beat + free mood = low bias', () => {
    const bias = chordToneBias(1, 'ambient');
    expect(bias).toBeLessThan(1.0);
  });

  it('moderate values for middle positions', () => {
    const bias = chordToneBias(4, 'lofi');
    expect(bias).toBeGreaterThan(0.9);
    expect(bias).toBeLessThan(1.2);
  });
});

describe('chordToneBiasMap', () => {
  it('returns correct length', () => {
    expect(chordToneBiasMap(16, 'trance')).toHaveLength(16);
    expect(chordToneBiasMap(8, 'lofi')).toHaveLength(8);
  });

  it('first position has highest bias', () => {
    const map = chordToneBiasMap(16, 'trance');
    expect(map[0]).toBe(Math.max(...map));
  });
});

describe('isChordTone', () => {
  it('identifies chord tones', () => {
    expect(isChordTone('C4', ['C3', 'E3', 'G3'])).toBe(true);
    expect(isChordTone('E5', ['C3', 'E3', 'G3'])).toBe(true);
  });

  it('rejects non-chord tones', () => {
    expect(isChordTone('D4', ['C3', 'E3', 'G3'])).toBe(false);
  });
});

describe('applyMetricConsonance', () => {
  it('preserves chord tones on strong beats', () => {
    const steps = ['C4', '~', '~', '~', 'E4', '~', '~', '~'];
    const result = applyMetricConsonance(steps, ['C3', 'E3', 'G3'], ['C', 'D', 'E', 'F', 'G'], 'trance');
    expect(result[0]).toBe('C4'); // chord tone, kept
    expect(result[4]).toBe('E4'); // chord tone, kept
  });

  it('preserves rests', () => {
    const steps = ['~', '~', '~', '~'];
    const result = applyMetricConsonance(steps, ['C3', 'E3'], ['C', 'D', 'E'], 'trance');
    expect(result).toEqual(['~', '~', '~', '~']);
  });

  it('skips processing for very free moods', () => {
    const steps = ['D4', 'F4', 'A4', 'B4'];
    const result = applyMetricConsonance(steps, ['C3', 'E3', 'G3'], ['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'syro');
    // Syro strength is 0.12 < 0.15, should return unchanged
    expect(result).toEqual(steps);
  });
});

describe('metricConsonanceStrength', () => {
  it('trance has highest', () => {
    expect(metricConsonanceStrength('trance')).toBe(0.70);
  });

  it('syro has lowest', () => {
    expect(metricConsonanceStrength('syro')).toBe(0.12);
  });
});
