import { describe, it, expect } from 'vitest';
import {
  arcRegisterOffset,
  arcSemitoneShift,
  shouldApplyMelodicArc,
  arcIntensity,
} from './melodic-arc';

describe('arcRegisterOffset', () => {
  it('build rises over time', () => {
    const early = arcRegisterOffset(0.1, 'avril', 'build');
    const late = arcRegisterOffset(0.9, 'avril', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('breakdown descends over time', () => {
    const early = arcRegisterOffset(0.1, 'avril', 'breakdown');
    const late = arcRegisterOffset(0.9, 'avril', 'breakdown');
    expect(early).toBeGreaterThan(late);
  });

  it('peak stays high', () => {
    const mid = arcRegisterOffset(0.5, 'avril', 'peak');
    expect(mid).toBeGreaterThan(0.3);
  });

  it('ambient has minimal arc', () => {
    const offset = arcRegisterOffset(1.0, 'ambient', 'build');
    expect(Math.abs(offset)).toBeLessThan(0.2);
  });
});

describe('arcSemitoneShift', () => {
  it('zero offset = no shift', () => {
    expect(arcSemitoneShift(0)).toBe(0);
  });

  it('full octave up', () => {
    expect(arcSemitoneShift(1.0)).toBe(12);
  });

  it('half octave rounds to 6', () => {
    expect(arcSemitoneShift(0.5)).toBe(6);
  });
});

describe('shouldApplyMelodicArc', () => {
  it('avril applies', () => {
    expect(shouldApplyMelodicArc('avril')).toBe(true);
  });

  it('ambient does not', () => {
    expect(shouldApplyMelodicArc('ambient')).toBe(false);
  });
});

describe('arcIntensity', () => {
  it('avril is highest', () => {
    expect(arcIntensity('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(arcIntensity('ambient')).toBe(0.15);
  });
});
