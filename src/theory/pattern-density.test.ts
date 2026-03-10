import { describe, it, expect } from 'vitest';
import { patternDegrade, shouldApplyDegrade } from './pattern-density';

describe('patternDegrade', () => {
  it('drone is never degraded', () => {
    expect(patternDegrade('drone', 'intro', 0)).toBe(0);
    expect(patternDegrade('drone', 'peak', 0.5)).toBe(0);
    expect(patternDegrade('drone', 'breakdown', 1)).toBe(0);
  });

  it('atmosphere is never degraded', () => {
    expect(patternDegrade('atmosphere', 'build', 0.5)).toBe(0);
  });

  it('melody intro starts sparse', () => {
    const d = patternDegrade('melody', 'intro', 0);
    expect(d).toBeGreaterThan(0.2);
  });

  it('melody peak is full density', () => {
    expect(patternDegrade('melody', 'peak', 0)).toBe(0);
    expect(patternDegrade('melody', 'peak', 0.5)).toBe(0);
    expect(patternDegrade('melody', 'peak', 1)).toBe(0);
  });

  it('arp build fills in over time', () => {
    const start = patternDegrade('arp', 'build', 0);
    const end = patternDegrade('arp', 'build', 1);
    expect(start).toBeGreaterThan(0.1);
    expect(end).toBe(0);
  });

  it('arp breakdown thins out over time', () => {
    const start = patternDegrade('arp', 'breakdown', 0);
    const end = patternDegrade('arp', 'breakdown', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('harmony has lighter degradation than arp', () => {
    const arpDeg = patternDegrade('arp', 'intro', 0);
    const harmDeg = patternDegrade('harmony', 'intro', 0);
    expect(harmDeg).toBeLessThan(arpDeg);
  });

  it('groove has light steady degradation', () => {
    const start = patternDegrade('melody', 'groove', 0);
    const end = patternDegrade('melody', 'groove', 1);
    expect(start).toBeCloseTo(end, 2);
    expect(start).toBeLessThan(0.15);
  });

  it('all values between 0 and 1', () => {
    const layers = ['melody', 'arp', 'harmony', 'texture', 'drone', 'atmosphere'];
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const layer of layers) {
      for (const section of sections) {
        for (let p = 0; p <= 1; p += 0.25) {
          const d = patternDegrade(layer, section, p);
          expect(d).toBeGreaterThanOrEqual(0);
          expect(d).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('clamps progress to 0-1', () => {
    const neg = patternDegrade('arp', 'build', -0.5);
    const zero = patternDegrade('arp', 'build', 0);
    expect(neg).toBeCloseTo(zero, 4);

    const over = patternDegrade('arp', 'build', 1.5);
    const one = patternDegrade('arp', 'build', 1);
    expect(over).toBeCloseTo(one, 4);
  });
});

describe('shouldApplyDegrade', () => {
  it('false for drone', () => {
    expect(shouldApplyDegrade('drone', 'intro')).toBe(false);
  });

  it('false for atmosphere', () => {
    expect(shouldApplyDegrade('atmosphere', 'peak')).toBe(false);
  });

  it('true for melody in intro', () => {
    expect(shouldApplyDegrade('melody', 'intro')).toBe(true);
  });

  it('false for melody at peak', () => {
    expect(shouldApplyDegrade('melody', 'peak')).toBe(false);
  });

  it('true for arp in build', () => {
    expect(shouldApplyDegrade('arp', 'build')).toBe(true);
  });
});
