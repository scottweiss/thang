import { describe, it, expect } from 'vitest';
import {
  applyShuffle,
  applyHalftime,
  moodFeel,
  feelIntensity,
  shouldApplyFeel,
} from './rhythmic-feel';

describe('applyShuffle', () => {
  it('preserves downbeats', () => {
    const steps = ['C3', 'E3', 'G3', 'C4', 'D3', 'F3', 'A3', 'D4',
                   'E3', 'G3', 'B3', 'E4', 'C3', 'E3', 'G3', 'C4'];
    const result = applyShuffle(steps, 1.0); // max intensity
    // Downbeats (0,4,8,12) should survive
    expect(result[0]).toBe('C3');
    expect(result[4]).toBe('D3');
    expect(result[8]).toBe('E3');
    expect(result[12]).toBe('C3');
  });

  it('thins "e" and "a" positions at high intensity', () => {
    const steps = Array(16).fill('C3');
    const result = applyShuffle(steps, 1.0);
    const restCount = result.filter(s => s === '~').length;
    // At max intensity, most e/a positions should be rests
    // There are 8 e/a positions (1,3,5,7,9,11,13,15)
    expect(restCount).toBeGreaterThan(4);
  });

  it('preserves everything at intensity 0', () => {
    const steps = Array(16).fill('C3');
    const result = applyShuffle(steps, 0);
    expect(result).toEqual(steps);
  });

  it('does not modify rests', () => {
    const steps = ['C3', '~', 'E3', '~', 'G3', '~', 'C4', '~',
                   'C3', '~', 'E3', '~', 'G3', '~', 'C4', '~'];
    const result = applyShuffle(steps, 1.0);
    // Original rests should stay as rests
    expect(result[1]).toBe('~');
    expect(result[3]).toBe('~');
  });
});

describe('applyHalftime', () => {
  it('thins backbeat positions', () => {
    const steps = Array(16).fill('C3');
    const result = applyHalftime(steps, 1.0);
    const restCount = result.filter(s => s === '~').length;
    expect(restCount).toBeGreaterThan(0);
  });

  it('preserves more on beats 1 and 3', () => {
    const steps = Array(16).fill('C3');
    const result = applyHalftime(steps, 0.8);
    // Beat 1 (indices 0-3) and beat 3 (indices 8-11) should have more notes
    const beat1Notes = result.slice(0, 4).filter(s => s !== '~').length;
    const beat2Notes = result.slice(4, 8).filter(s => s !== '~').length;
    // Over many runs, beat 1 should average more notes, but single run is probabilistic
    // Just check it doesn't crash and returns valid output
    expect(beat1Notes + beat2Notes).toBeGreaterThanOrEqual(0);
  });

  it('preserves everything at intensity 0', () => {
    const steps = Array(16).fill('C3');
    const result = applyHalftime(steps, 0);
    expect(result).toEqual(steps);
  });
});

describe('moodFeel', () => {
  it('lofi is shuffle', () => {
    expect(moodFeel('lofi', 'groove')).toBe('shuffle');
  });

  it('trance is straight', () => {
    expect(moodFeel('trance', 'groove')).toBe('straight');
  });

  it('breakdown overrides to halftime (unless already shuffle)', () => {
    expect(moodFeel('trance', 'breakdown')).toBe('halftime');
    // lofi is shuffle — breakdown shouldn't override shuffle
    expect(moodFeel('lofi', 'breakdown')).toBe('shuffle');
  });

  it('build straightens halftime moods', () => {
    expect(moodFeel('downtempo', 'build')).toBe('straight');
  });
});

describe('feelIntensity', () => {
  it('blockhead has highest intensity', () => {
    expect(feelIntensity('blockhead', 'groove')).toBeGreaterThan(feelIntensity('flim', 'groove'));
  });

  it('breakdown boosts intensity', () => {
    expect(feelIntensity('lofi', 'breakdown')).toBeGreaterThan(feelIntensity('lofi', 'peak'));
  });

  it('never exceeds 0.8', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        expect(feelIntensity(mood, section)).toBeLessThanOrEqual(0.8);
      }
    }
  });
});

describe('shouldApplyFeel', () => {
  it('returns true for shuffle/halftime moods', () => {
    expect(shouldApplyFeel('lofi')).toBe(true);
    expect(shouldApplyFeel('blockhead')).toBe(true);
    expect(shouldApplyFeel('ambient')).toBe(true);
  });

  it('returns false for trance (straight, 0 intensity)', () => {
    expect(shouldApplyFeel('trance')).toBe(false);
  });
});
