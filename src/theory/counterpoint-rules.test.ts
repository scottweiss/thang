import { describe, it, expect } from 'vitest';
import {
  hasParallelPerfect,
  counterpointScore,
  counterpointStrictness,
} from './counterpoint-rules';

describe('hasParallelPerfect', () => {
  it('detects parallel fifths', () => {
    expect(hasParallelPerfect(7, 7)).toBe(true);
  });

  it('detects parallel octaves', () => {
    expect(hasParallelPerfect(0, 0)).toBe(true);
  });

  it('no parallel when intervals differ', () => {
    expect(hasParallelPerfect(7, 4)).toBe(false);
  });

  it('no parallel for non-perfect intervals', () => {
    expect(hasParallelPerfect(4, 4)).toBe(false); // major thirds
  });
});

describe('counterpointScore', () => {
  it('contrary motion scores high', () => {
    // Melody goes up (0→2), arp goes down (7→5) = contrary
    const score = counterpointScore(0, 2, 7, 5, 'avril');
    expect(score).toBeGreaterThan(0.7);
  });

  it('parallel fifths score low for strict moods', () => {
    // Both move up by 2 semitones, maintaining fifth
    const score = counterpointScore(0, 2, 5, 7, 'avril');
    // prev interval = -5, curr interval = -5 → parallel perfect
    expect(score).toBeLessThan(0.8);
  });

  it('syro is more lenient', () => {
    const avril = counterpointScore(0, 2, 5, 7, 'avril');
    const syro = counterpointScore(0, 2, 5, 7, 'syro');
    expect(syro).toBeGreaterThanOrEqual(avril);
  });

  it('stays in 0-1 range', () => {
    for (let m = 0; m < 5; m++) {
      for (let a = 0; a < 5; a++) {
        const s = counterpointScore(0, m, 7, a, 'lofi');
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('counterpointStrictness', () => {
  it('avril is highest', () => {
    expect(counterpointStrictness('avril')).toBe(0.65);
  });

  it('disco is low', () => {
    expect(counterpointStrictness('disco')).toBe(0.15);
  });
});
