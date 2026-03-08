import { describe, it, expect } from 'vitest';
import {
  layerDisplacement,
  displacementDepth,
} from './displacement-layering';

describe('layerDisplacement', () => {
  it('drone has no displacement', () => {
    expect(layerDisplacement('drone', 'syro', 'groove')).toBe(0);
  });

  it('arp has more displacement than harmony', () => {
    const arp = layerDisplacement('arp', 'xtal', 'groove');
    const harmony = layerDisplacement('harmony', 'xtal', 'groove');
    expect(arp).toBeGreaterThan(harmony);
  });

  it('peak section has less displacement', () => {
    const groove = layerDisplacement('melody', 'flim', 'groove');
    const peak = layerDisplacement('melody', 'flim', 'peak');
    expect(groove).toBeGreaterThan(peak);
  });

  it('stays reasonable (< 0.08s)', () => {
    const offset = layerDisplacement('arp', 'syro', 'breakdown');
    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset).toBeLessThanOrEqual(0.08);
  });

  it('tight mood has less displacement', () => {
    const disco = layerDisplacement('melody', 'disco', 'groove');
    const syro = layerDisplacement('melody', 'syro', 'groove');
    expect(syro).toBeGreaterThan(disco);
  });
});

describe('displacementDepth', () => {
  it('syro is deepest', () => {
    expect(displacementDepth('syro')).toBe(0.55);
  });

  it('disco is shallow', () => {
    expect(displacementDepth('disco')).toBe(0.08);
  });
});
