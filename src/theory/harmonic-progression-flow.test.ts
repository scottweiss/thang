import { describe, it, expect } from 'vitest';
import {
  progressionFlowRoom,
  flowSensitivity,
} from './harmonic-progression-flow';

describe('progressionFlowRoom', () => {
  it('step motion gets more reverb', () => {
    const room = progressionFlowRoom('C', 'D', 'ambient');
    expect(room).toBeGreaterThan(1.0);
  });

  it('fifth leap gets less reverb', () => {
    const room = progressionFlowRoom('C', 'G', 'ambient');
    expect(room).toBeLessThan(1.0);
  });

  it('no motion is neutral', () => {
    const room = progressionFlowRoom('C', 'C', 'ambient');
    expect(room).toBe(1.0);
  });

  it('ambient is more sensitive than disco', () => {
    const amb = progressionFlowRoom('C', 'D', 'ambient');
    const disco = progressionFlowRoom('C', 'D', 'disco');
    expect(amb).toBeGreaterThan(disco);
  });

  it('stays in 0.96-1.04 range', () => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    for (const r of roots) {
      const room = progressionFlowRoom('C', r, 'ambient');
      expect(room).toBeGreaterThanOrEqual(0.96);
      expect(room).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('flowSensitivity', () => {
  it('ambient is highest', () => {
    expect(flowSensitivity('ambient')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(flowSensitivity('disco')).toBe(0.20);
  });
});
