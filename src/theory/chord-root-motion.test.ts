import { describe, it, expect } from 'vitest';
import {
  rootMotionQuality,
  rootMotionGainMultiplier,
  strongMotionPreference,
} from './chord-root-motion';

describe('rootMotionQuality', () => {
  it('perfect fifth is strongest', () => {
    expect(rootMotionQuality(7)).toBe(0.95);
  });

  it('perfect fourth is strong', () => {
    expect(rootMotionQuality(5)).toBe(0.9);
  });

  it('tritone is weak', () => {
    expect(rootMotionQuality(6)).toBe(0.35);
  });

  it('unison is static', () => {
    expect(rootMotionQuality(0)).toBe(0.3);
  });

  it('fifth stronger than step', () => {
    expect(rootMotionQuality(7)).toBeGreaterThan(rootMotionQuality(2));
  });

  it('handles negative intervals', () => {
    expect(rootMotionQuality(-5)).toBe(rootMotionQuality(7)); // -5 mod 12 = 7
  });
});

describe('rootMotionGainMultiplier', () => {
  it('strong motion boosts gain for functional moods', () => {
    const mul = rootMotionGainMultiplier(7, 'avril'); // perfect fifth
    expect(mul).toBeGreaterThan(1.0);
  });

  it('stays in 0.90-1.12 range', () => {
    for (let i = 0; i < 12; i++) {
      const mul = rootMotionGainMultiplier(i, 'trance');
      expect(mul).toBeGreaterThanOrEqual(0.90);
      expect(mul).toBeLessThanOrEqual(1.12);
    }
  });

  it('weak motion gets less boost', () => {
    const strong = rootMotionGainMultiplier(7, 'avril');
    const weak = rootMotionGainMultiplier(6, 'avril');
    expect(strong).toBeGreaterThan(weak);
  });
});

describe('strongMotionPreference', () => {
  it('avril is highest', () => {
    expect(strongMotionPreference('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(strongMotionPreference('syro')).toBe(0.20);
  });
});
