import { describe, it, expect } from 'vitest';
import {
  tensionOrchestrationGain,
  shouldApplyTensionOrchestration,
} from './tension-orchestration';

describe('tensionOrchestrationGain', () => {
  it('drone is louder at low tension', () => {
    const low = tensionOrchestrationGain('drone', 0.1, 'downtempo');
    const high = tensionOrchestrationGain('drone', 0.9, 'downtempo');
    expect(low).toBeGreaterThan(high);
  });

  it('melody is louder at high tension', () => {
    const low = tensionOrchestrationGain('melody', 0.1, 'downtempo');
    const high = tensionOrchestrationGain('melody', 0.9, 'downtempo');
    expect(high).toBeGreaterThan(low);
  });

  it('arp is most responsive — widest range', () => {
    const arpLow = tensionOrchestrationGain('arp', 0.0, 'trance');
    const arpHigh = tensionOrchestrationGain('arp', 1.0, 'trance');
    const harmLow = tensionOrchestrationGain('harmony', 0.0, 'trance');
    const harmHigh = tensionOrchestrationGain('harmony', 1.0, 'trance');
    const arpRange = arpHigh - arpLow;
    const harmRange = harmHigh - harmLow;
    expect(arpRange).toBeGreaterThan(harmRange);
  });

  it('atmosphere is inverse of melody', () => {
    const atmoLow = tensionOrchestrationGain('atmosphere', 0.1, 'lofi');
    const atmoHigh = tensionOrchestrationGain('atmosphere', 0.9, 'lofi');
    expect(atmoLow).toBeGreaterThan(atmoHigh); // atmosphere recedes at high tension
  });

  it('returns 1.0 at medium tension (0.5) for all layers', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const layer of layers) {
      const gain = tensionOrchestrationGain(layer, 0.5, 'downtempo');
      expect(gain).toBeCloseTo(1.0, 1);
    }
  });

  it('returns 1.0 for unknown layer', () => {
    expect(tensionOrchestrationGain('unknown', 0.8, 'lofi')).toBe(1.0);
  });

  it('mood depth scales the effect', () => {
    // trance has depth 0.7, ambient has depth 0.4
    const tranceDrone = tensionOrchestrationGain('drone', 0.0, 'trance');
    const ambientDrone = tensionOrchestrationGain('drone', 0.0, 'ambient');
    // Both should be > 1 (drone loud at low tension), but trance more so
    expect(tranceDrone).toBeGreaterThan(ambientDrone);
  });

  it('gains stay within reasonable range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const mood of moods) {
      for (const layer of layers) {
        for (let t = 0; t <= 1; t += 0.1) {
          const gain = tensionOrchestrationGain(layer, t, mood);
          expect(gain).toBeGreaterThanOrEqual(0.6);
          expect(gain).toBeLessThanOrEqual(1.4);
        }
      }
    }
  });

  it('is smooth — no sudden jumps', () => {
    const gains: number[] = [];
    for (let t = 0; t <= 1; t += 0.05) {
      gains.push(tensionOrchestrationGain('melody', t, 'lofi'));
    }
    for (let i = 1; i < gains.length; i++) {
      const diff = Math.abs(gains[i] - gains[i - 1]);
      expect(diff).toBeLessThan(0.05); // no jumps > 5%
    }
  });
});

describe('shouldApplyTensionOrchestration', () => {
  it('returns true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyTensionOrchestration(mood)).toBe(true);
    }
  });
});
