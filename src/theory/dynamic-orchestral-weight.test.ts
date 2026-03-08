import { describe, it, expect } from 'vitest';
import {
  orchestralWeightGain,
  weightSensitivity,
} from './dynamic-orchestral-weight';

describe('orchestralWeightGain', () => {
  it('drone gets slight boost with many layers', () => {
    const allLayers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    const gain = orchestralWeightGain('drone', allLayers, 'blockhead');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('arp gets reduction with many layers', () => {
    const allLayers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    const gain = orchestralWeightGain('arp', allLayers, 'blockhead');
    expect(gain).toBeLessThan(1.0);
  });

  it('single layer is nearly neutral', () => {
    const gain = orchestralWeightGain('melody', ['melody'], 'ambient');
    expect(gain).toBeGreaterThanOrEqual(0.97);
    expect(gain).toBeLessThanOrEqual(1.03);
  });

  it('blockhead is more sensitive than syro', () => {
    const allLayers = ['drone', 'harmony', 'melody', 'arp'];
    const bhArp = orchestralWeightGain('arp', allLayers, 'blockhead');
    const syroArp = orchestralWeightGain('arp', allLayers, 'syro');
    // blockhead reduces arp more (lower gain)
    expect(bhArp).toBeLessThan(syroArp);
  });

  it('stays in 0.88-1.05 range', () => {
    const allLayers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const layer of allLayers) {
      const gain = orchestralWeightGain(layer, allLayers, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('weightSensitivity', () => {
  it('blockhead is highest', () => {
    expect(weightSensitivity('blockhead')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(weightSensitivity('syro')).toBe(0.30);
  });
});
