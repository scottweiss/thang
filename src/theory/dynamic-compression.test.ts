import { describe, it, expect } from 'vitest';
import {
  compressedGain,
  compressionMultiplier,
  compressionRatio,
} from './dynamic-compression';

describe('compressedGain', () => {
  it('pulls quiet gain toward section target', () => {
    const compressed = compressedGain(0.2, 'blockhead', 'peak');
    expect(compressed).toBeGreaterThan(0.2);
  });

  it('pulls loud gain toward section target', () => {
    const compressed = compressedGain(1.0, 'blockhead', 'intro');
    expect(compressed).toBeLessThan(1.0);
  });

  it('stays in 0.1-1.0 range', () => {
    expect(compressedGain(0.0, 'ambient', 'peak')).toBeGreaterThanOrEqual(0.1);
    expect(compressedGain(1.0, 'disco', 'peak')).toBeLessThanOrEqual(1.0);
  });

  it('blockhead compresses more than ambient', () => {
    const bh = compressedGain(0.2, 'blockhead', 'peak');
    const amb = compressedGain(0.2, 'ambient', 'peak');
    // Blockhead should pull 0.2 more toward 0.85 (peak target)
    expect(bh).toBeGreaterThan(amb);
  });
});

describe('compressionMultiplier', () => {
  it('quiet sounds in peak get boosted', () => {
    const mul = compressionMultiplier(0.3, 'blockhead', 'peak');
    expect(mul).toBeGreaterThan(1.0);
  });

  it('loud sounds in intro get reduced', () => {
    const mul = compressionMultiplier(0.9, 'disco', 'intro');
    expect(mul).toBeLessThan(1.0);
  });

  it('stays in 0.6-1.4 range', () => {
    expect(compressionMultiplier(0.1, 'blockhead', 'peak')).toBeLessThanOrEqual(1.4);
    expect(compressionMultiplier(1.0, 'disco', 'intro')).toBeGreaterThanOrEqual(0.6);
  });

  it('near-zero gain returns 1.0', () => {
    expect(compressionMultiplier(0.001, 'lofi', 'build')).toBe(1.0);
  });
});

describe('compressionRatio', () => {
  it('blockhead is highest', () => {
    expect(compressionRatio('blockhead')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(compressionRatio('ambient')).toBe(0.25);
  });
});
