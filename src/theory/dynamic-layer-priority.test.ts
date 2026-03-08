import { describe, it, expect } from 'vitest';
import {
  layerPriorityGain,
  priorityStrength,
} from './dynamic-layer-priority';

describe('layerPriorityGain', () => {
  it('melody active reduces supporting layers', () => {
    const gain = layerPriorityGain(true, 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('melody absent boosts supporting layers', () => {
    const gain = layerPriorityGain(false, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('avril defers more than syro', () => {
    const avril = layerPriorityGain(true, 'avril');
    const syro = layerPriorityGain(true, 'syro');
    expect(avril).toBeLessThan(syro);
  });

  it('stays in 0.88-1.05 range', () => {
    const gain1 = layerPriorityGain(true, 'avril');
    const gain2 = layerPriorityGain(false, 'avril');
    expect(gain1).toBeGreaterThanOrEqual(0.88);
    expect(gain2).toBeLessThanOrEqual(1.05);
  });
});

describe('priorityStrength', () => {
  it('avril is highest', () => {
    expect(priorityStrength('avril')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(priorityStrength('syro')).toBe(0.25);
  });
});
