import { describe, it, expect } from 'vitest';
import {
  harmonicAcceleration,
  shouldAccelerate,
  harmonicAccelStrength,
} from './harmonic-rhythm-acceleration';

describe('harmonicAcceleration', () => {
  it('phrase start has longer chords', () => {
    const start = harmonicAcceleration(0.1, 'avril', 'build');
    const end = harmonicAcceleration(0.9, 'avril', 'build');
    expect(start).toBeGreaterThan(end);
  });

  it('avril accelerates more than syro', () => {
    const avril = harmonicAcceleration(0.9, 'avril', 'build');
    const syro = harmonicAcceleration(0.9, 'syro', 'build');
    expect(avril).toBeLessThan(syro); // lower = faster changes
  });

  it('stays in 0.5-1.2 range', () => {
    for (let p = 0; p <= 1; p += 0.2) {
      const a = harmonicAcceleration(p, 'ambient', 'build');
      expect(a).toBeGreaterThanOrEqual(0.5);
      expect(a).toBeLessThanOrEqual(1.2);
    }
  });
});

describe('shouldAccelerate', () => {
  it('true in second half for avril', () => {
    expect(shouldAccelerate(0.7, 'avril', 'build')).toBe(true);
  });

  it('false in first half', () => {
    expect(shouldAccelerate(0.3, 'avril', 'build')).toBe(false);
  });
});

describe('harmonicAccelStrength', () => {
  it('avril is highest', () => {
    expect(harmonicAccelStrength('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(harmonicAccelStrength('syro')).toBe(0.15);
  });
});
