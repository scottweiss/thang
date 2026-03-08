import { describe, it, expect } from 'vitest';
import {
  maskingAvoidanceGain,
  maskingSensitivity,
} from './frequency-masking-avoidance';

describe('maskingAvoidanceGain', () => {
  it('melody and arp (close) get reduction', () => {
    const gain = maskingAvoidanceGain('melody', 'arp', 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('drone and atmosphere (far) return 1.0', () => {
    const gain = maskingAvoidanceGain('drone', 'atmosphere', 'ambient');
    expect(gain).toBe(1.0);
  });

  it('ambient is more sensitive than syro', () => {
    const amb = maskingAvoidanceGain('melody', 'arp', 'ambient');
    const syro = maskingAvoidanceGain('melody', 'arp', 'syro');
    expect(amb).toBeLessThan(syro);
  });

  it('stays in 0.88-1.0 range', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const l1 of layers) {
      for (const l2 of layers) {
        const gain = maskingAvoidanceGain(l1, l2, 'ambient');
        expect(gain).toBeGreaterThanOrEqual(0.88);
        expect(gain).toBeLessThanOrEqual(1.0);
      }
    }
  });
});

describe('maskingSensitivity', () => {
  it('ambient is highest', () => {
    expect(maskingSensitivity('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(maskingSensitivity('syro')).toBe(0.35);
  });
});
