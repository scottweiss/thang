import { describe, it, expect } from 'vitest';
import {
  reharmCooldown,
  shouldCooldownReharm,
  reharmTolerance,
} from './reharm-density';

describe('reharmCooldown', () => {
  it('no recent reharms → full probability (1.0)', () => {
    expect(reharmCooldown(0, 'lofi')).toBe(1.0);
  });

  it('one recent reharm → slight cooldown (0.8)', () => {
    expect(reharmCooldown(1, 'lofi')).toBe(0.8);
  });

  it('at tolerance → reduced but not zero', () => {
    const tolerance = reharmTolerance('lofi'); // 3
    const cooldown = reharmCooldown(tolerance, 'lofi');
    expect(cooldown).toBeGreaterThan(0);
    expect(cooldown).toBeLessThan(0.5);
  });

  it('well beyond tolerance → near zero', () => {
    const cooldown = reharmCooldown(6, 'trance'); // trance tolerance=1, way over
    expect(cooldown).toBeLessThan(0.1);
    expect(cooldown).toBeGreaterThan(0); // never exactly zero
  });

  it('within tolerance → gradual reduction', () => {
    const c1 = reharmCooldown(1, 'lofi');
    const c2 = reharmCooldown(2, 'lofi');
    expect(c1).toBeGreaterThan(c2);
  });

  it('trance cools down faster than lofi', () => {
    const tranceCooldown = reharmCooldown(2, 'trance');
    const lofiCooldown = reharmCooldown(2, 'lofi');
    expect(tranceCooldown).toBeLessThan(lofiCooldown);
  });

  it('minimum is 0.05 (never fully suppressed)', () => {
    const cooldown = reharmCooldown(20, 'ambient');
    expect(cooldown).toBeGreaterThanOrEqual(0.05);
  });
});

describe('shouldCooldownReharm', () => {
  it('false when no recent reharms', () => {
    expect(shouldCooldownReharm(0, 'lofi')).toBe(false);
  });

  it('true when well beyond tolerance', () => {
    expect(shouldCooldownReharm(5, 'trance')).toBe(true);
  });

  it('false for single reharm in tolerant mood', () => {
    expect(shouldCooldownReharm(1, 'lofi')).toBe(false);
  });
});

describe('reharmTolerance', () => {
  it('lofi has high tolerance', () => {
    expect(reharmTolerance('lofi')).toBe(3);
  });

  it('trance has low tolerance', () => {
    expect(reharmTolerance('trance')).toBe(1);
  });
});
