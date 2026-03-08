import { describe, it, expect } from 'vitest';
import {
  stasisLevel,
  stasisFmCompensation,
  stasisLpfModulation,
  stasisTolerance,
} from './harmonic-stasis-detection';

describe('stasisLevel', () => {
  it('fresh chord change is 0', () => {
    expect(stasisLevel(0, 'trance')).toBe(0);
  });

  it('long stasis approaches 1', () => {
    const level = stasisLevel(20, 'syro');
    expect(level).toBeGreaterThan(0.5);
  });

  it('tolerant mood takes longer to stagnate', () => {
    const ambient = stasisLevel(5, 'ambient');
    const syro = stasisLevel(5, 'syro');
    expect(syro).toBeGreaterThan(ambient);
  });

  it('stays in 0-1 range', () => {
    const level = stasisLevel(100, 'syro');
    expect(level).toBeGreaterThanOrEqual(0);
    expect(level).toBeLessThanOrEqual(1);
  });
});

describe('stasisFmCompensation', () => {
  it('fresh chord returns 1.0', () => {
    expect(stasisFmCompensation(0, 'trance')).toBe(1.0);
  });

  it('stasis increases FM', () => {
    const fresh = stasisFmCompensation(0, 'syro');
    const stale = stasisFmCompensation(20, 'syro');
    expect(stale).toBeGreaterThan(fresh);
  });

  it('stays in 1.0-1.25 range', () => {
    const fm = stasisFmCompensation(50, 'avril');
    expect(fm).toBeGreaterThanOrEqual(1.0);
    expect(fm).toBeLessThanOrEqual(1.25);
  });
});

describe('stasisLpfModulation', () => {
  it('fresh chord returns 1.0', () => {
    expect(stasisLpfModulation(0, 'ambient')).toBe(1.0);
  });

  it('stays in 1.0-1.2 range', () => {
    const lpf = stasisLpfModulation(50, 'syro');
    expect(lpf).toBeGreaterThanOrEqual(1.0);
    expect(lpf).toBeLessThanOrEqual(1.2);
  });
});

describe('stasisTolerance', () => {
  it('ambient is highest', () => {
    expect(stasisTolerance('ambient')).toBe(0.75);
  });

  it('syro is low', () => {
    expect(stasisTolerance('syro')).toBe(0.25);
  });
});
