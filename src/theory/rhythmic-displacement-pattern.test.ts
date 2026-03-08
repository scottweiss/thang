import { describe, it, expect } from 'vitest';
import {
  shouldDisplace,
  displacementAmount,
  displacementProbability,
} from './rhythmic-displacement-pattern';

describe('shouldDisplace', () => {
  it('returns boolean', () => {
    expect(typeof shouldDisplace(0, 'lofi', 'groove')).toBe('boolean');
  });

  it('syro displaces more than trance', () => {
    let syroCount = 0;
    let tranceCount = 0;
    for (let tick = 0; tick < 200; tick++) {
      if (shouldDisplace(tick, 'syro', 'groove')) syroCount++;
      if (shouldDisplace(tick, 'trance', 'groove')) tranceCount++;
    }
    expect(syroCount).toBeGreaterThan(tranceCount);
  });

  it('is deterministic', () => {
    const a = shouldDisplace(42, 'blockhead', 'peak');
    const b = shouldDisplace(42, 'blockhead', 'peak');
    expect(a).toBe(b);
  });
});

describe('displacementAmount', () => {
  it('returns a positive number', () => {
    expect(displacementAmount(0, 'lofi')).toBeGreaterThan(0);
  });

  it('stays within expected range', () => {
    for (let tick = 0; tick < 100; tick++) {
      const amount = displacementAmount(tick, 'lofi');
      expect(amount).toBeGreaterThanOrEqual(0.0625);
      expect(amount).toBeLessThanOrEqual(0.1875);
    }
  });

  it('is deterministic', () => {
    expect(displacementAmount(10, 'syro')).toBe(displacementAmount(10, 'syro'));
  });
});

describe('displacementProbability', () => {
  it('syro is highest', () => {
    expect(displacementProbability('syro')).toBe(0.45);
  });

  it('ambient is lowest', () => {
    expect(displacementProbability('ambient')).toBe(0.05);
  });
});
