import { describe, it, expect } from 'vitest';
import {
  shouldHoldPedal,
  maxPedalLength,
  pedalTendency,
} from './harmonic-pedal-tone';

describe('shouldHoldPedal', () => {
  it('stops after max length', () => {
    expect(shouldHoldPedal('lofi', 'groove', 3, 0)).toBe(false);
  });

  it('fires sometimes within range', () => {
    let holds = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldHoldPedal('ambient', 'breakdown', 0, t)) holds++;
    }
    // ambient * breakdown = 0.60 * 1.4 = 0.84
    expect(holds).toBeGreaterThan(30);
  });

  it('less likely during builds', () => {
    let buildHolds = 0, breakdownHolds = 0;
    for (let t = 0; t < 200; t++) {
      if (shouldHoldPedal('lofi', 'build', 0, t)) buildHolds++;
      if (shouldHoldPedal('lofi', 'breakdown', 0, t)) breakdownHolds++;
    }
    expect(breakdownHolds).toBeGreaterThan(buildHolds);
  });

  it('deterministic', () => {
    const a = shouldHoldPedal('lofi', 'groove', 1, 42);
    const b = shouldHoldPedal('lofi', 'groove', 1, 42);
    expect(a).toBe(b);
  });
});

describe('maxPedalLength', () => {
  it('ambient is longest', () => {
    expect(maxPedalLength('ambient')).toBe(6);
  });

  it('syro is shortest', () => {
    expect(maxPedalLength('syro')).toBe(2);
  });
});

describe('pedalTendency', () => {
  it('ambient is strongest', () => {
    expect(pedalTendency('ambient')).toBe(0.60);
  });

  it('syro is weakest', () => {
    expect(pedalTendency('syro')).toBe(0.15);
  });
});
