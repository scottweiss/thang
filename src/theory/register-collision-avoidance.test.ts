import { describe, it, expect } from 'vitest';
import {
  registerCollision,
  suggestOctaveShift,
  collisionGainReduction,
  shouldAvoidCollisions,
  collisionSensitivity,
} from './register-collision-avoidance';

describe('registerCollision', () => {
  it('no collision when > 12 semitones apart', () => {
    expect(registerCollision({ melody: 72, harmony: 48 }, 'melody', 'harmony')).toBe(0);
  });

  it('collision when same pitch', () => {
    expect(registerCollision({ melody: 60, harmony: 60 }, 'melody', 'harmony')).toBe(1.0);
  });

  it('partial collision when close', () => {
    const collision = registerCollision({ melody: 64, harmony: 60 }, 'melody', 'harmony');
    expect(collision).toBeGreaterThan(0);
    expect(collision).toBeLessThan(1);
  });

  it('0 for missing layers', () => {
    expect(registerCollision({ melody: 60 }, 'melody', 'harmony')).toBe(0);
  });
});

describe('suggestOctaveShift', () => {
  it('no shift when far apart', () => {
    expect(suggestOctaveShift(72, 48, 'lofi')).toBe(0);
  });

  it('shift up when above and colliding', () => {
    expect(suggestOctaveShift(62, 60, 'ambient')).toBe(1);
  });

  it('shift down when below and colliding', () => {
    expect(suggestOctaveShift(58, 60, 'ambient')).toBe(-1);
  });

  it('tolerant moods need higher severity to trigger', () => {
    // syro has low sensitivity (0.30) — mild collision won't trigger
    expect(suggestOctaveShift(64, 60, 'syro')).toBe(0);
    // ambient has high sensitivity (0.65) — same collision triggers
    expect(suggestOctaveShift(64, 60, 'ambient')).not.toBe(0);
  });
});

describe('collisionGainReduction', () => {
  it('primary layer unaffected', () => {
    expect(collisionGainReduction(0.8, 'lofi', true)).toBe(1.0);
  });

  it('secondary layer reduced', () => {
    expect(collisionGainReduction(0.8, 'lofi', false)).toBeLessThan(1.0);
  });

  it('no reduction without collision', () => {
    expect(collisionGainReduction(0, 'lofi', false)).toBe(1.0);
  });

  it('clamped at 0.85', () => {
    expect(collisionGainReduction(1.0, 'ambient', false)).toBeGreaterThanOrEqual(0.85);
  });
});

describe('shouldAvoidCollisions', () => {
  it('true with 3+ layers', () => {
    expect(shouldAvoidCollisions('lofi', 4)).toBe(true);
  });

  it('false with 2 layers', () => {
    expect(shouldAvoidCollisions('lofi', 2)).toBe(false);
  });
});

describe('collisionSensitivity', () => {
  it('ambient is most sensitive', () => {
    expect(collisionSensitivity('ambient')).toBe(0.65);
  });

  it('syro is least sensitive', () => {
    expect(collisionSensitivity('syro')).toBe(0.30);
  });
});
