import { describe, it, expect } from 'vitest';
import {
  palindromeScore,
  shouldPreferPalindrome,
  palindromeAffinity,
} from './rhythmic-palindrome';

describe('palindromeScore', () => {
  it('perfect palindrome scores 1.0', () => {
    expect(palindromeScore([true, false, true])).toBe(1.0);
  });

  it('anti-palindrome scores 0.0', () => {
    // T,F,T,F → compare [0]↔[3]: T↔F=no, [1]↔[2]: F↔T=no → 0/2 = 0.0
    expect(palindromeScore([true, false, true, false])).toBe(0.0);
  });

  it('single element scores 1.0', () => {
    expect(palindromeScore([true])).toBe(1.0);
  });

  it('empty scores 1.0', () => {
    expect(palindromeScore([])).toBe(1.0);
  });

  it('partial match gives score between 0 and 1', () => {
    const score = palindromeScore([true, false, true, true]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1.0);
  });

  it('ABBA pattern is palindrome', () => {
    // T,F,F,T reversed = T,F,F,T → perfect palindrome
    expect(palindromeScore([true, false, false, true])).toBe(1.0);
  });
});

describe('shouldPreferPalindrome', () => {
  it('xtal prefers palindrome more often than syro', () => {
    let xtalCount = 0, syroCount = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldPreferPalindrome(t, 'xtal', 'build')) xtalCount++;
      if (shouldPreferPalindrome(t, 'syro', 'build')) syroCount++;
    }
    expect(xtalCount).toBeGreaterThan(syroCount);
  });

  it('breakdown section prefers palindrome more', () => {
    let breakCount = 0, peakCount = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldPreferPalindrome(t, 'flim', 'breakdown')) breakCount++;
      if (shouldPreferPalindrome(t, 'flim', 'peak')) peakCount++;
    }
    expect(breakCount).toBeGreaterThan(peakCount);
  });
});

describe('palindromeAffinity', () => {
  it('xtal is highest', () => {
    expect(palindromeAffinity('xtal')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(palindromeAffinity('syro')).toBe(0.15);
  });
});
