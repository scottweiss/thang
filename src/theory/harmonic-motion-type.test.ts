import { describe, it, expect } from 'vitest';
import {
  detectMotion,
  motionTypeGain,
  motionPreference,
} from './harmonic-motion-type';

describe('detectMotion', () => {
  it('opposite directions is contrary', () => {
    expect(detectMotion(3, -2)).toBe('contrary');
  });

  it('one stationary is oblique', () => {
    expect(detectMotion(0, 3)).toBe('oblique');
  });

  it('same direction is parallel', () => {
    expect(detectMotion(2, 3)).toBe('parallel');
  });

  it('both zero is static', () => {
    expect(detectMotion(0, 0)).toBe('static');
  });
});

describe('motionTypeGain', () => {
  it('contrary gets boost', () => {
    const gain = motionTypeGain('contrary', 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('parallel gets reduction', () => {
    const gain = motionTypeGain('parallel', 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('stays in 0.95-1.06 range', () => {
    for (const m of ['contrary', 'oblique', 'parallel', 'static'] as const) {
      const gain = motionTypeGain(m, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.95);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('motionPreference', () => {
  it('avril is highest', () => {
    expect(motionPreference('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(motionPreference('syro')).toBe(0.15);
  });
});
