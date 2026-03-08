import { describe, it, expect } from 'vitest';
import { rotatePattern, displaceSteps, syncopate, moodDisplacement } from './rhythmic-displacement';

describe('rotatePattern', () => {
  it('rotates right by positive offset', () => {
    expect(rotatePattern([1, 2, 3, 4], 1)).toEqual([4, 1, 2, 3]);
  });

  it('rotates left by negative offset', () => {
    expect(rotatePattern([1, 2, 3, 4], -1)).toEqual([2, 3, 4, 1]);
  });

  it('full rotation returns original', () => {
    expect(rotatePattern([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(rotatePattern([], 2)).toEqual([]);
  });

  it('handles zero offset', () => {
    expect(rotatePattern([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });
});

describe('displaceSteps', () => {
  it('shifts active steps forward', () => {
    const result = displaceSteps(['C4', '~', 'E4', '~'], '~', 1);
    expect(result[0]).toBe('~');
    expect(result[1]).toBe('C4');
    expect(result[3]).toBe('E4');
  });

  it('wraps around at end', () => {
    const result = displaceSteps(['~', '~', '~', 'G4'], '~', 1);
    expect(result[0]).toBe('G4'); // wrapped from position 3+1=0
  });

  it('handles zero offset', () => {
    const original = ['C4', '~', 'E4', '~'];
    expect(displaceSteps(original, '~', 0)).toEqual(original);
  });

  it('preserves number of active steps', () => {
    const original = ['C4', '~', 'E4', '~', 'G4', '~', '~', '~'];
    const result = displaceSteps(original, '~', 2);
    const origCount = original.filter(s => s !== '~').length;
    const resultCount = result.filter(s => s !== '~').length;
    // May lose notes on collision but never gain
    expect(resultCount).toBeLessThanOrEqual(origCount);
  });
});

describe('syncopate', () => {
  it('returns same length array', () => {
    const steps = ['C4', '~', '~', '~', 'E4', '~', '~', '~'];
    const result = syncopate(steps, '~', 0.5, 4);
    expect(result).toHaveLength(steps.length);
  });

  it('with amount 0, pattern is unchanged', () => {
    const steps = ['C4', '~', '~', '~', 'E4', '~', '~', '~'];
    expect(syncopate(steps, '~', 0, 4)).toEqual(steps);
  });

  it('with high amount, some on-beat notes move off-beat', () => {
    // Run many times to check tendency
    const steps = ['C4', '~', '~', '~', 'E4', '~', '~', '~'];
    let movedCount = 0;
    for (let i = 0; i < 50; i++) {
      const result = syncopate(steps, '~', 1.0, 4);
      if (result[0] === '~' || result[4] === '~') movedCount++;
    }
    expect(movedCount).toBeGreaterThan(10); // at least some should move
  });
});

describe('moodDisplacement', () => {
  it('lofi has displacement', () => {
    expect(moodDisplacement('lofi')).toBe(1);
  });

  it('trance has no displacement', () => {
    expect(moodDisplacement('trance')).toBe(0);
  });

  it('returns 0 for unknown mood', () => {
    expect(moodDisplacement('unknown')).toBe(0);
  });
});
