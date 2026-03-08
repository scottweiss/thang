import { describe, it, expect } from 'vitest';
import {
  shouldDouble,
  doublingOctave,
  doublingProbability,
} from './cross-register-doubling';

describe('shouldDouble', () => {
  it('false when not important note', () => {
    expect(shouldDouble(0, 'trance', 'peak', false)).toBe(false);
  });

  it('returns boolean for important note', () => {
    expect(typeof shouldDouble(0, 'trance', 'peak', true)).toBe('boolean');
  });

  it('trance peak doubles more than ambient breakdown', () => {
    let tranceCount = 0;
    let ambientCount = 0;
    for (let tick = 0; tick < 200; tick++) {
      if (shouldDouble(tick, 'trance', 'peak', true)) tranceCount++;
      if (shouldDouble(tick, 'ambient', 'breakdown', true)) ambientCount++;
    }
    expect(tranceCount).toBeGreaterThan(ambientCount);
  });

  it('is deterministic', () => {
    expect(shouldDouble(42, 'avril', 'peak', true)).toBe(
      shouldDouble(42, 'avril', 'peak', true)
    );
  });
});

describe('doublingOctave', () => {
  it('returns -1 or 1', () => {
    for (let tick = 0; tick < 50; tick++) {
      const oct = doublingOctave(tick);
      expect(oct === -1 || oct === 1).toBe(true);
    }
  });
});

describe('doublingProbability', () => {
  it('avril is highest', () => {
    expect(doublingProbability('avril')).toBe(0.40);
  });

  it('ambient is lowest', () => {
    expect(doublingProbability('ambient')).toBe(0.05);
  });
});
