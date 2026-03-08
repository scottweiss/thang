import { describe, it, expect } from 'vitest';
import {
  syncopationReduction,
  downbeatBias,
  applyRhythmicResolution,
  resolutionStrength,
} from './rhythmic-resolution';

describe('syncopationReduction', () => {
  it('no reduction in early section', () => {
    expect(syncopationReduction(0.3, 'trance')).toBe(1.0);
    expect(syncopationReduction(0.5, 'trance')).toBe(1.0);
    expect(syncopationReduction(0.74, 'trance')).toBe(1.0);
  });

  it('reduces near end for strong moods', () => {
    const reduction = syncopationReduction(0.95, 'trance');
    expect(reduction).toBeLessThan(0.7);
  });

  it('barely reduces for ambient', () => {
    const reduction = syncopationReduction(0.95, 'ambient');
    expect(reduction).toBeGreaterThan(0.9);
  });

  it('monotonically decreases toward end', () => {
    const mid = syncopationReduction(0.85, 'avril');
    const late = syncopationReduction(0.95, 'avril');
    expect(late).toBeLessThanOrEqual(mid);
  });

  it('never goes below 0', () => {
    const result = syncopationReduction(1.0, 'trance');
    expect(result).toBeGreaterThanOrEqual(0.0);
  });
});

describe('downbeatBias', () => {
  it('returns uniform weights early in section', () => {
    const weights = downbeatBias(16, 0.3, 'trance');
    expect(weights.every(w => w === 1.0)).toBe(true);
  });

  it('returns correct length', () => {
    expect(downbeatBias(16, 0.9, 'trance')).toHaveLength(16);
    expect(downbeatBias(8, 0.9, 'trance')).toHaveLength(8);
  });

  it('beat 1 gets highest weight near end', () => {
    const weights = downbeatBias(16, 0.95, 'trance');
    expect(weights[0]).toBe(Math.max(...weights));
  });

  it('16th positions get lowest weight near end', () => {
    const weights = downbeatBias(16, 0.95, 'trance');
    expect(weights[1]).toBeLessThan(weights[0]);
    expect(weights[1]).toBeLessThan(weights[4]);
  });
});

describe('applyRhythmicResolution', () => {
  it('no change early in section', () => {
    const steps = ['C4', '~', 'E4', '~', 'G4', '~', 'A4', '~'];
    const result = applyRhythmicResolution(steps, 0.3, 'trance');
    expect(result).toEqual(steps);
  });

  it('preserves rests', () => {
    const steps = ['~', '~', '~', '~', '~', '~', '~', '~'];
    const result = applyRhythmicResolution(steps, 0.95, 'trance');
    expect(result).toEqual(steps);
  });

  it('preserves notes on strong beats', () => {
    const steps = ['C4', '~', '~', '~', 'E4', '~', '~', '~',
                   'G4', '~', '~', '~', 'A4', '~', '~', '~'];
    const result = applyRhythmicResolution(steps, 0.95, 'trance');
    // Positions 0, 4, 8, 12 are strong beats — should stay
    expect(result[0]).toBe('C4');
    expect(result[4]).toBe('E4');
    expect(result[8]).toBe('G4');
    expect(result[12]).toBe('A4');
  });

  it('is deterministic', () => {
    const steps = ['~', 'C4', '~', 'E4', '~', 'G4', '~', 'A4',
                   '~', 'C5', '~', 'E5', '~', 'G5', '~', 'A5'];
    const a = applyRhythmicResolution(steps, 0.95, 'trance');
    const b = applyRhythmicResolution(steps, 0.95, 'trance');
    expect(a).toEqual(b);
  });
});

describe('resolutionStrength', () => {
  it('trance has highest', () => {
    expect(resolutionStrength('trance')).toBe(0.55);
  });

  it('ambient has lowest', () => {
    expect(resolutionStrength('ambient')).toBe(0.05);
  });
});
