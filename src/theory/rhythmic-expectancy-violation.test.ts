import { describe, it, expect } from 'vitest';
import {
  expectancyViolation,
  expectancyGainEmphasis,
  violationAppetite,
} from './rhythmic-expectancy-violation';

describe('expectancyViolation', () => {
  it('downbeat has zero violation', () => {
    expect(expectancyViolation(0, 'syro', 'peak')).toBe(0);
  });

  it('backbeat has zero violation', () => {
    expect(expectancyViolation(8, 'lofi', 'groove')).toBe(0);
  });

  it('sixteenth beat has highest violation', () => {
    const sixteenth = expectancyViolation(1, 'flim', 'build');
    const quarter = expectancyViolation(4, 'flim', 'build');
    expect(sixteenth).toBeGreaterThan(quarter);
  });

  it('hungry mood has more violation', () => {
    const syro = expectancyViolation(3, 'syro', 'groove');
    const trance = expectancyViolation(3, 'trance', 'groove');
    expect(syro).toBeGreaterThan(trance);
  });

  it('stays in 0-1 range', () => {
    for (let p = 0; p < 16; p++) {
      const v = expectancyViolation(p, 'syro', 'breakdown');
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('expectancyGainEmphasis', () => {
  it('stays in 0.95-1.12 range', () => {
    const gain = expectancyGainEmphasis(5, 'lofi', 'groove');
    expect(gain).toBeGreaterThanOrEqual(0.95);
    expect(gain).toBeLessThanOrEqual(1.12);
  });

  it('off-beat gets more emphasis', () => {
    const onBeat = expectancyGainEmphasis(0, 'blockhead', 'build');
    const offBeat = expectancyGainEmphasis(3, 'blockhead', 'build');
    expect(offBeat).toBeGreaterThan(onBeat);
  });
});

describe('violationAppetite', () => {
  it('syro is high', () => {
    expect(violationAppetite('syro')).toBe(0.65);
  });

  it('trance is low', () => {
    expect(violationAppetite('trance')).toBe(0.15);
  });
});
