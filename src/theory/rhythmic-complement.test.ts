import { describe, it, expect } from 'vitest';
import {
  complementGain,
  complementScore,
  complementStrength,
} from './rhythmic-complement';

describe('complementGain', () => {
  it('boost when partner is quiet', () => {
    const gain = complementGain(0.8, 0.1, 'lofi', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('no boost when both active', () => {
    const gain = complementGain(0.5, 0.5, 'lofi', 'build');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('no boost when we rest', () => {
    const gain = complementGain(0.1, 0.8, 'lofi', 'build');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('flim boosts more than ambient', () => {
    const flim = complementGain(0.8, 0.1, 'flim', 'groove');
    const ambient = complementGain(0.8, 0.1, 'ambient', 'groove');
    expect(flim).toBeGreaterThan(ambient);
  });

  it('stays in 0.9-1.2 range', () => {
    const gain = complementGain(1.0, 0.0, 'flim', 'groove');
    expect(gain).toBeGreaterThanOrEqual(0.9);
    expect(gain).toBeLessThanOrEqual(1.2);
  });
});

describe('complementScore', () => {
  it('perfect complement scores 1.0', () => {
    expect(complementScore(
      [true, false, true, false],
      [false, true, false, true]
    )).toBe(1.0);
  });

  it('identical patterns score 0.0', () => {
    expect(complementScore(
      [true, true, false, false],
      [true, true, false, false]
    )).toBe(0.0);
  });

  it('partial complement scores between 0 and 1', () => {
    const score = complementScore(
      [true, true, false, false],
      [false, true, true, false]
    );
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('empty returns 0', () => {
    expect(complementScore([], [])).toBe(0);
  });
});

describe('complementStrength', () => {
  it('flim is high', () => {
    expect(complementStrength('flim')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(complementStrength('ambient')).toBe(0.15);
  });
});
