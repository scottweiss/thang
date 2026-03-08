import { describe, it, expect } from 'vitest';
import {
  microAccelTendency,
  microAccelOffset,
  accelStrengthValue,
} from './rhythmic-micro-acceleration';

describe('microAccelTendency', () => {
  it('first note pushes ahead (negative)', () => {
    expect(microAccelTendency(0)).toBeLessThan(0);
  });

  it('second note pushes more (momentum)', () => {
    expect(microAccelTendency(1)).toBeLessThan(microAccelTendency(0));
  });

  it('mid-group is neutral', () => {
    expect(microAccelTendency(2)).toBe(0);
  });

  it('last note drags (positive)', () => {
    expect(microAccelTendency(3)).toBeGreaterThan(0);
  });

  it('pattern repeats every 4 steps', () => {
    expect(microAccelTendency(4)).toBe(microAccelTendency(0));
    expect(microAccelTendency(7)).toBe(microAccelTendency(3));
  });
});

describe('microAccelOffset', () => {
  it('push-ahead positions get negative offset', () => {
    const offset = microAccelOffset(1, 'syro', 'peak');
    expect(offset).toBeLessThan(0);
  });

  it('neutral position = 0 offset', () => {
    expect(microAccelOffset(2, 'syro', 'peak')).toBe(0);
  });

  it('drag position gets positive offset', () => {
    const offset = microAccelOffset(3, 'syro', 'peak');
    expect(offset).toBeGreaterThan(0);
  });

  it('stays within ±0.015 seconds', () => {
    for (let p = 0; p < 16; p++) {
      const offset = microAccelOffset(p, 'syro', 'peak');
      expect(offset).toBeGreaterThanOrEqual(-0.015);
      expect(offset).toBeLessThanOrEqual(0.015);
    }
  });

  it('syro has larger offsets than ambient', () => {
    const syro = Math.abs(microAccelOffset(1, 'syro', 'peak'));
    const amb = Math.abs(microAccelOffset(1, 'ambient', 'peak'));
    expect(syro).toBeGreaterThan(amb);
  });
});

describe('accelStrengthValue', () => {
  it('syro is highest', () => {
    expect(accelStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(accelStrengthValue('ambient')).toBe(0.10);
  });
});
