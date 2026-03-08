import { describe, it, expect } from 'vitest';
import {
  spreadControlGain,
  spreadSensitivity,
} from './voicing-spread-control';

describe('spreadControlGain', () => {
  it('low tension in breakdown gets boost', () => {
    const gain = spreadControlGain(0.2, 'ambient', 'breakdown');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('high tension in peak gets boost', () => {
    const gain = spreadControlGain(0.8, 'ambient', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('ambient is more sensitive than syro', () => {
    const amb = spreadControlGain(0.2, 'ambient', 'breakdown');
    const sy = spreadControlGain(0.2, 'syro', 'breakdown');
    expect(amb).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const gain = spreadControlGain(t, 'ambient', 'build');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('spreadSensitivity', () => {
  it('ambient is highest', () => {
    expect(spreadSensitivity('ambient')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(spreadSensitivity('syro')).toBe(0.20);
  });
});
