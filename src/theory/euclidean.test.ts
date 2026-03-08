import { describe, it, expect } from 'vitest';
import { euclidean, rotatePattern, euclideanFillPositions } from './euclidean';

/** Check that hits are maximally even — no two gaps differ by more than 1 */
function isMaximallyEven(pattern: boolean[]): boolean {
  const positions = pattern.map((h, i) => h ? i : -1).filter(i => i >= 0);
  if (positions.length <= 1) return true;
  const gaps: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    gaps.push(positions[i] - positions[i - 1]);
  }
  // Wrap-around gap
  gaps.push(pattern.length - positions[positions.length - 1] + positions[0]);
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);
  return maxGap - minGap <= 1;
}

describe('euclidean', () => {
  it('E(3,8) produces 3 evenly spaced hits in 8 steps', () => {
    const result = euclidean(3, 8);
    expect(result).toHaveLength(8);
    expect(result.filter(Boolean).length).toBe(3);
    expect(isMaximallyEven(result)).toBe(true);
  });

  it('E(5,8) produces 5 evenly spaced hits in 8 steps', () => {
    const result = euclidean(5, 8);
    expect(result).toHaveLength(8);
    expect(result.filter(Boolean).length).toBe(5);
    expect(isMaximallyEven(result)).toBe(true);
  });

  it('E(4,16) produces 4 evenly spaced hits', () => {
    const result = euclidean(4, 16);
    expect(result).toHaveLength(16);
    expect(result.filter(Boolean).length).toBe(4);
    expect(isMaximallyEven(result)).toBe(true);
  });

  it('E(7,16) produces 7 evenly spaced hits', () => {
    const result = euclidean(7, 16);
    expect(result).toHaveLength(16);
    expect(result.filter(Boolean).length).toBe(7);
    expect(isMaximallyEven(result)).toBe(true);
  });

  it('E(0,8) produces all rests', () => {
    expect(euclidean(0, 8)).toEqual(new Array(8).fill(false));
  });

  it('E(8,8) produces all hits', () => {
    expect(euclidean(8, 8)).toEqual(new Array(8).fill(true));
  });

  it('E(1,8) produces single hit', () => {
    const result = euclidean(1, 8);
    expect(result).toHaveLength(8);
    expect(result.filter(Boolean).length).toBe(1);
  });

  it('E(5,16) produces bossa nova pattern', () => {
    const result = euclidean(5, 16);
    expect(result).toHaveLength(16);
    expect(result.filter(Boolean).length).toBe(5);
    expect(isMaximallyEven(result)).toBe(true);
  });
});

describe('rotatePattern', () => {
  it('rotates pattern by positive offset', () => {
    const pattern = [true, false, false, true, false];
    const rotated = rotatePattern(pattern, 1);
    expect(rotated).toHaveLength(5);
    expect(rotated[4]).toBe(pattern[0]); // first element wraps to end
  });

  it('rotation of 0 returns same pattern', () => {
    const pattern = [true, false, true];
    expect(rotatePattern(pattern, 0)).toEqual([true, false, true]);
  });

  it('full rotation returns same pattern', () => {
    const pattern = [true, false, true];
    expect(rotatePattern(pattern, 3)).toEqual([true, false, true]);
  });
});

describe('euclideanFillPositions', () => {
  it('returns correct number of positions', () => {
    const positions = euclideanFillPositions(3, 8);
    expect(positions).toHaveLength(3);
  });

  it('returns all positions for full pattern', () => {
    expect(euclideanFillPositions(4, 4)).toEqual([0, 1, 2, 3]);
  });

  it('returns empty for zero pulses', () => {
    expect(euclideanFillPositions(0, 8)).toEqual([]);
  });

  it('rotation shifts positions', () => {
    const noRot = euclideanFillPositions(3, 8, 0);
    const withRot = euclideanFillPositions(3, 8, 1);
    expect(noRot).not.toEqual(withRot);
    // Same number of hits regardless of rotation
    expect(withRot).toHaveLength(noRot.length);
  });

  it('all positions are within bounds', () => {
    const positions = euclideanFillPositions(7, 16);
    positions.forEach(p => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(16);
    });
  });
});
