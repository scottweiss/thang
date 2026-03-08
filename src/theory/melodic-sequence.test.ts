import { describe, it, expect } from 'vitest';
import {
  generateSequence,
  flattenSequence,
  sequenceDirection,
  shouldUseSequence,
} from './melodic-sequence';

const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'];

describe('generateSequence', () => {
  it('ascending sequence transposes correctly', () => {
    const result = generateSequence(['C3', 'D3', 'E3'], ladder, 3, 1);
    expect(result).toEqual([
      ['C3', 'D3', 'E3'],
      ['D3', 'E3', 'F3'],
      ['E3', 'F3', 'G3'],
    ]);
  });

  it('descending sequence works', () => {
    const result = generateSequence(['G3', 'A3', 'B3'], ladder, 3, -1);
    expect(result).toEqual([
      ['G3', 'A3', 'B3'],
      ['F3', 'G3', 'A3'],
      ['E3', 'F3', 'G3'],
    ]);
  });

  it('clamps to ladder boundaries', () => {
    // Starting near the top, ascending — should clamp
    const result = generateSequence(['D4', 'E4'], ladder, 3, 2);
    expect(result[0]).toEqual(['D4', 'E4']);
    // Second rep shifts +2: D4(idx8)+2=E4(idx9), E4(idx9)+2=clamped to E4(idx9)
    expect(result[1]).toEqual(['E4', 'E4']);
    // Third rep shifts +4: both clamp to E4
    expect(result[2]).toEqual(['E4', 'E4']);

    // Starting near the bottom, descending — should clamp
    const descResult = generateSequence(['C3', 'D3'], ladder, 3, -2);
    expect(descResult[0]).toEqual(['C3', 'D3']);
    expect(descResult[1]).toEqual(['C3', 'C3']);
    expect(descResult[2]).toEqual(['C3', 'C3']);
  });

  it('single repetition returns just the original', () => {
    const result = generateSequence(['C3', 'E3', 'G3'], ladder, 1, 2);
    expect(result).toEqual([['C3', 'E3', 'G3']]);
  });
});

describe('flattenSequence', () => {
  it('inserts rests between repetitions', () => {
    const sequences = [['C3', 'D3'], ['E3', 'F3']];
    const result = flattenSequence(sequences, 1);
    expect(result).toEqual(['C3', 'D3', '~', 'E3', 'F3']);
  });

  it('zero rests between concatenates directly', () => {
    const sequences = [['C3', 'D3'], ['E3', 'F3'], ['G3', 'A3']];
    const result = flattenSequence(sequences, 0);
    expect(result).toEqual(['C3', 'D3', 'E3', 'F3', 'G3', 'A3']);
  });
});

describe('sequenceDirection', () => {
  it('build has positive stepSize', () => {
    const dir = sequenceDirection('build', 0.5);
    expect(dir.stepSize).toBeGreaterThan(0);
  });

  it('breakdown has negative stepSize', () => {
    const dir = sequenceDirection('breakdown', 0.5);
    expect(dir.stepSize).toBeLessThan(0);
  });

  it('high tension increases repetitions', () => {
    const low = sequenceDirection('build', 0.1);
    const high = sequenceDirection('build', 0.9);
    expect(high.repetitions).toBeGreaterThanOrEqual(low.repetitions);
  });
});

describe('shouldUseSequence', () => {
  it('too-short motifs never sequence', () => {
    for (let i = 0; i < 50; i++) {
      expect(shouldUseSequence('build', 1)).toBe(false);
      expect(shouldUseSequence('peak', 0)).toBe(false);
    }
  });

  it('build section has higher chance than breakdown', () => {
    const runs = 100;
    let buildYes = 0;
    let breakdownYes = 0;

    for (let i = 0; i < runs; i++) {
      if (shouldUseSequence('build', 4)) buildYes++;
      if (shouldUseSequence('breakdown', 4)) breakdownYes++;
    }

    expect(buildYes).toBeGreaterThan(breakdownYes);
  });
});
