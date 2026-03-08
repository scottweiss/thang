import { describe, it, expect } from 'vitest';
import {
  partialsAlignmentScore,
  partialsReinforcementFm,
  reinforcementSensitivity,
} from './harmonic-partials-reinforcement';

describe('partialsAlignmentScore', () => {
  it('perfect fifth scores high', () => {
    const score = partialsAlignmentScore([0, 7]); // C + G
    expect(score).toBeGreaterThan(0.7);
  });

  it('tritone scores low', () => {
    const fifth = partialsAlignmentScore([0, 7]);
    const tritone = partialsAlignmentScore([0, 6]);
    expect(fifth).toBeGreaterThan(tritone);
  });

  it('major triad scores well', () => {
    const score = partialsAlignmentScore([0, 4, 7]); // C E G
    expect(score).toBeGreaterThan(0.5);
  });

  it('single note returns 0.5', () => {
    expect(partialsAlignmentScore([0])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = partialsAlignmentScore([0, 3, 6, 9]); // dim7
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('partialsReinforcementFm', () => {
  it('aligned voicing boosts FM', () => {
    const fm = partialsReinforcementFm([0, 7], 'xtal'); // perfect fifth
    expect(fm).toBeGreaterThan(1.0);
  });

  it('stays in 0.90-1.15 range', () => {
    const fm = partialsReinforcementFm([0, 4, 7], 'ambient');
    expect(fm).toBeGreaterThanOrEqual(0.90);
    expect(fm).toBeLessThanOrEqual(1.15);
  });

  it('sensitive mood responds more', () => {
    const xtal = partialsReinforcementFm([0, 7], 'xtal');
    const syro = partialsReinforcementFm([0, 7], 'syro');
    expect(Math.abs(xtal - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('reinforcementSensitivity', () => {
  it('xtal is highest', () => {
    expect(reinforcementSensitivity('xtal')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(reinforcementSensitivity('syro')).toBe(0.20);
  });
});
