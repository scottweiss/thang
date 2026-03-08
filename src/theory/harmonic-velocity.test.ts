import { describe, it, expect } from 'vitest';
import {
  rootDistance,
  velocityGainBoost,
  velocityBrightnessBoost,
  velocitySensitivity,
} from './harmonic-velocity';

describe('rootDistance', () => {
  it('0 for same root', () => {
    expect(rootDistance(0, 0)).toBe(0);
  });

  it('5 for C→F (perfect fourth)', () => {
    expect(rootDistance(0, 5)).toBe(5);
  });

  it('folds at tritone: C→Gb = 6', () => {
    expect(rootDistance(0, 6)).toBe(6);
  });

  it('folds: C→G = 5 (not 7)', () => {
    expect(rootDistance(0, 7)).toBe(5);
  });

  it('symmetric', () => {
    expect(rootDistance(0, 3)).toBe(rootDistance(3, 0));
  });
});

describe('velocityGainBoost', () => {
  it('1.0 for no movement', () => {
    expect(velocityGainBoost(0, 'avril')).toBe(1.0);
  });

  it('> 1.0 for large movement', () => {
    expect(velocityGainBoost(5, 'avril')).toBeGreaterThan(1.0);
  });

  it('larger movement = more boost', () => {
    const small = velocityGainBoost(2, 'avril');
    const large = velocityGainBoost(5, 'avril');
    expect(large).toBeGreaterThan(small);
  });

  it('stays in 1.0-1.1 range', () => {
    const g = velocityGainBoost(6, 'avril');
    expect(g).toBeLessThanOrEqual(1.1);
  });
});

describe('velocityBrightnessBoost', () => {
  it('1.0 for no movement', () => {
    expect(velocityBrightnessBoost(0, 'lofi')).toBe(1.0);
  });

  it('> 1.0 for large movement', () => {
    expect(velocityBrightnessBoost(5, 'lofi')).toBeGreaterThan(1.0);
  });
});

describe('velocitySensitivity', () => {
  it('avril is highest', () => {
    expect(velocitySensitivity('avril')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(velocitySensitivity('ambient')).toBe(0.20);
  });
});
