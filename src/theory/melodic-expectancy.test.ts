import { describe, it, expect } from 'vitest';
import {
  expectancyWeight,
  expectancyConformity,
} from './melodic-expectancy';

describe('expectancyWeight', () => {
  it('small interval + same direction = high weight', () => {
    // prev: up 3, candidate: up 2 → continuation
    const w = expectancyWeight(3, 2, 'trance');
    expect(w).toBeGreaterThan(1.0);
  });

  it('small interval + reversal = moderate', () => {
    // prev: up 3, candidate: down 1
    const w = expectancyWeight(3, -1, 'trance');
    expect(w).toBeGreaterThan(0.8);
  });

  it('large interval + reversal = high weight', () => {
    // prev: up 8, candidate: down 2
    const w = expectancyWeight(8, -2, 'trance');
    expect(w).toBeGreaterThan(1.0);
  });

  it('large interval + same direction = low weight', () => {
    // prev: up 8, candidate: up 7
    const w = expectancyWeight(8, 7, 'trance');
    expect(w).toBeLessThan(1.0);
  });

  it('syro is less predictable than trance', () => {
    // Same scenario — syro should have less extreme weighting
    const trance = expectancyWeight(3, 2, 'trance');
    const syro = expectancyWeight(3, 2, 'syro');
    expect(Math.abs(trance - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });

  it('weight stays in 0.5-2.0 range', () => {
    const intervals = [-12, -7, -3, -1, 0, 1, 3, 7, 12];
    for (const prev of intervals) {
      for (const cand of intervals) {
        const w = expectancyWeight(prev, cand, 'trance');
        expect(w).toBeGreaterThanOrEqual(0.5);
        expect(w).toBeLessThanOrEqual(2.0);
      }
    }
  });
});

describe('expectancyConformity', () => {
  it('trance is highest', () => {
    expect(expectancyConformity('trance')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(expectancyConformity('syro')).toBe(0.20);
  });
});
