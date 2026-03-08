import { describe, it, expect } from 'vitest';
import {
  phaseAlignmentScore,
  alignmentGainBoost,
  alignmentEmphasis,
} from './rhythmic-phase-alignment';

describe('phaseAlignmentScore', () => {
  it('all same position = 1.0', () => {
    expect(phaseAlignmentScore([0, 0, 0])).toBe(1.0);
  });

  it('all different positions = 0', () => {
    expect(phaseAlignmentScore([0, 4, 8])).toBe(0);
  });

  it('partial alignment scores between', () => {
    const score = phaseAlignmentScore([0, 0, 4]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('single layer returns 0', () => {
    expect(phaseAlignmentScore([5])).toBe(0);
  });
});

describe('alignmentGainBoost', () => {
  it('high alignment gets boost', () => {
    const boost = alignmentGainBoost(4, 4, 'blockhead');
    expect(boost).toBeGreaterThan(1.0);
  });

  it('no alignment returns 1.0', () => {
    expect(alignmentGainBoost(4, 1, 'trance')).toBe(1.0);
  });

  it('stays in 1.0-1.15 range', () => {
    const boost = alignmentGainBoost(6, 6, 'blockhead');
    expect(boost).toBeGreaterThanOrEqual(1.0);
    expect(boost).toBeLessThanOrEqual(1.15);
  });

  it('strong mood boosts more', () => {
    const blockhead = alignmentGainBoost(4, 4, 'blockhead');
    const ambient = alignmentGainBoost(4, 4, 'ambient');
    expect(blockhead).toBeGreaterThan(ambient);
  });
});

describe('alignmentEmphasis', () => {
  it('blockhead is strongest', () => {
    expect(alignmentEmphasis('blockhead')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(alignmentEmphasis('ambient')).toBe(0.15);
  });
});
