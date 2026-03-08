import { describe, it, expect } from 'vitest';
import {
  shouldHoldPedal,
  pedalSustainMultiplier,
  pedalDecayMultiplier,
  pedalTendency,
} from './pedal-bass-sustain';

describe('shouldHoldPedal', () => {
  it('returns boolean', () => {
    const result = shouldHoldPedal(0, 'ambient', 'intro', 10);
    expect(typeof result).toBe('boolean');
  });

  it('never holds during cooldown', () => {
    for (let tick = 0; tick < 50; tick++) {
      expect(shouldHoldPedal(tick, 'ambient', 'intro', 1)).toBe(false);
      expect(shouldHoldPedal(tick, 'ambient', 'intro', 2)).toBe(false);
    }
  });

  it('ambient intro holds more than trance peak', () => {
    let ambientCount = 0;
    let tranceCount = 0;
    for (let tick = 0; tick < 200; tick++) {
      if (shouldHoldPedal(tick, 'ambient', 'intro', 10)) ambientCount++;
      if (shouldHoldPedal(tick, 'trance', 'peak', 10)) tranceCount++;
    }
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });
});

describe('pedalSustainMultiplier', () => {
  it('returns between 1.2 and 2.0', () => {
    const result = pedalSustainMultiplier('ambient', 'intro');
    expect(result).toBeGreaterThanOrEqual(1.2);
    expect(result).toBeLessThanOrEqual(2.0);
  });

  it('ambient intro > syro peak', () => {
    expect(pedalSustainMultiplier('ambient', 'intro')).toBeGreaterThan(
      pedalSustainMultiplier('syro', 'peak')
    );
  });
});

describe('pedalDecayMultiplier', () => {
  it('returns between 1.0 and 1.5', () => {
    const result = pedalDecayMultiplier('ambient');
    expect(result).toBeGreaterThanOrEqual(1.0);
    expect(result).toBeLessThanOrEqual(1.5);
  });

  it('ambient > syro', () => {
    expect(pedalDecayMultiplier('ambient')).toBeGreaterThan(
      pedalDecayMultiplier('syro')
    );
  });
});

describe('pedalTendency', () => {
  it('ambient is highest', () => {
    expect(pedalTendency('ambient')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(pedalTendency('syro')).toBe(0.25);
  });
});
