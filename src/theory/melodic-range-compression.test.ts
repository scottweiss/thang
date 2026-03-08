import { describe, it, expect } from 'vitest';
import {
  rangeCompression,
  compressionSensitivity,
} from './melodic-range-compression';

describe('rangeCompression', () => {
  it('peak with high tension is expanded', () => {
    const range = rangeCompression(0.9, 'avril', 'peak');
    expect(range).toBeGreaterThan(0.8);
  });

  it('intro with low tension is compressed', () => {
    const range = rangeCompression(0.1, 'avril', 'intro');
    expect(range).toBeLessThan(0.8);
  });

  it('peak is wider than intro', () => {
    const peak = rangeCompression(0.5, 'flim', 'peak');
    const intro = rangeCompression(0.5, 'flim', 'intro');
    expect(peak).toBeGreaterThan(intro);
  });

  it('stays in 0.4-1.2 range', () => {
    for (let t = 0; t <= 1.0; t += 0.2) {
      const r = rangeCompression(t, 'ambient', 'peak');
      expect(r).toBeGreaterThanOrEqual(0.4);
      expect(r).toBeLessThanOrEqual(1.2);
    }
  });
});

describe('compressionSensitivity', () => {
  it('avril is highest', () => {
    expect(compressionSensitivity('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(compressionSensitivity('syro')).toBe(0.20);
  });
});
