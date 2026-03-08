import { describe, it, expect } from 'vitest';
import {
  layerTempoRatio,
  shouldApplyStrata,
  strataStrength,
} from './rhythmic-strata';

describe('layerTempoRatio', () => {
  it('returns positive number', () => {
    const ratio = layerTempoRatio('melody', 0, 'syro', 'breakdown');
    expect(ratio).toBeGreaterThan(0);
  });

  it('stays in 0.5-3.0 range', () => {
    for (let tick = 0; tick < 100; tick++) {
      for (const layer of ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere']) {
        const ratio = layerTempoRatio(layer, tick, 'syro', 'breakdown');
        expect(ratio).toBeGreaterThanOrEqual(0.5);
        expect(ratio).toBeLessThanOrEqual(3.0);
      }
    }
  });

  it('trance mostly returns 1.0', () => {
    let unifiedCount = 0;
    for (let tick = 0; tick < 100; tick++) {
      if (layerTempoRatio('arp', tick, 'trance', 'groove') === 1.0) unifiedCount++;
    }
    expect(unifiedCount).toBeGreaterThan(80);
  });

  it('syro returns non-1.0 sometimes', () => {
    let nonUnified = 0;
    for (let tick = 0; tick < 100; tick++) {
      if (layerTempoRatio('arp', tick, 'syro', 'breakdown') !== 1.0) nonUnified++;
    }
    expect(nonUnified).toBeGreaterThan(5);
  });
});

describe('shouldApplyStrata', () => {
  it('true for syro breakdown', () => {
    expect(shouldApplyStrata('syro', 'breakdown')).toBe(true);
  });

  it('false for disco intro', () => {
    expect(shouldApplyStrata('disco', 'intro')).toBe(false);
  });
});

describe('strataStrength', () => {
  it('syro is highest', () => {
    expect(strataStrength('syro')).toBe(0.50);
  });

  it('disco is lowest', () => {
    expect(strataStrength('disco')).toBe(0.08);
  });
});
