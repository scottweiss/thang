import { describe, it, expect } from 'vitest';
import {
  axisPoints,
  nearestAxisPoint,
  suggestSymmetricMove,
  selectAxisType,
  shouldApplySymmetric,
  symmetricTendency,
} from './symmetric-division';

describe('axisPoints', () => {
  it('major thirds from C = [C, E, Ab]', () => {
    const points = axisPoints('C', 'major-third');
    expect(points).toHaveLength(3);
    expect(points[0]).toBe('C');
    expect(points[1]).toBe('E');
    expect(points[2]).toBe('Ab');
  });

  it('minor thirds from C = [C, Eb, F#, A]', () => {
    const points = axisPoints('C', 'minor-third');
    expect(points).toHaveLength(4);
    expect(points[0]).toBe('C');
    expect(points[1]).toBe('Eb');
    expect(points[2]).toBe('F#');
    expect(points[3]).toBe('A');
  });

  it('tritone from C = [C, F#]', () => {
    const points = axisPoints('C', 'tritone');
    expect(points).toHaveLength(2);
    expect(points[0]).toBe('C');
    expect(points[1]).toBe('F#');
  });

  it('whole tone from C = 6 points', () => {
    const points = axisPoints('C', 'whole-tone');
    expect(points).toHaveLength(6);
  });

  it('works from non-C roots', () => {
    const points = axisPoints('D', 'major-third');
    expect(points).toHaveLength(3);
    expect(points[0]).toBe('D');
    expect(points[1]).toBe('F#');
    expect(points[2]).toBe('Bb');
  });
});

describe('nearestAxisPoint', () => {
  it('finds nearest major-third axis point', () => {
    // From F, nearest axis point of C-E-Ab: E (1 semitone away)
    const nearest = nearestAxisPoint('F', 'C', 'major-third');
    expect(nearest).toBe('E');
  });

  it('excludes current note if on axis', () => {
    // C is on its own axis, should return E or Ab
    const nearest = nearestAxisPoint('C', 'C', 'major-third');
    expect(['E', 'Ab']).toContain(nearest);
  });
});

describe('suggestSymmetricMove', () => {
  it('returns a different note from current', () => {
    const result = suggestSymmetricMove('C', 'major-third', 42);
    expect(result).not.toBe('C');
  });

  it('returns an axis point', () => {
    const points = axisPoints('C', 'major-third');
    const result = suggestSymmetricMove('C', 'major-third', 42);
    expect(points).toContain(result);
  });

  it('is deterministic', () => {
    const a = suggestSymmetricMove('G', 'minor-third', 99);
    const b = suggestSymmetricMove('G', 'minor-third', 99);
    expect(a).toBe(b);
  });
});

describe('selectAxisType', () => {
  it('is deterministic', () => {
    const a = selectAxisType('lofi', 42);
    const b = selectAxisType('lofi', 42);
    expect(a).toBe(b);
  });

  it('returns valid axis type', () => {
    const result = selectAxisType('syro', 100);
    expect(['major-third', 'minor-third', 'tritone', 'whole-tone']).toContain(result);
  });
});

describe('shouldApplySymmetric', () => {
  it('is deterministic', () => {
    const a = shouldApplySymmetric(42, 'syro', 'breakdown');
    const b = shouldApplySymmetric(42, 'syro', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more symmetric than intro', () => {
    const breakdownCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplySymmetric(i, 'syro', 'breakdown')
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplySymmetric(i, 'syro', 'intro')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(introCount);
  });
});

describe('symmetricTendency', () => {
  it('syro has highest', () => {
    expect(symmetricTendency('syro')).toBe(0.25);
  });

  it('trance has lowest', () => {
    expect(symmetricTendency('trance')).toBe(0.02);
  });
});
