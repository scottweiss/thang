import { describe, it, expect } from 'vitest';
import {
  qualityDecay,
  qualitySensitivity,
} from './quality-envelope-decay';

describe('qualityDecay', () => {
  it('major extends decay', () => {
    const mul = qualityDecay('maj', 'avril');
    expect(mul).toBeGreaterThan(1.0);
  });

  it('diminished shortens decay', () => {
    const mul = qualityDecay('dim', 'avril');
    expect(mul).toBeLessThan(1.0);
  });

  it('maj7 is lush (longest)', () => {
    const maj7 = qualityDecay('maj7', 'lofi');
    const min = qualityDecay('min', 'lofi');
    expect(maj7).toBeGreaterThan(min);
  });

  it('dom7 wants resolution (shorter)', () => {
    const dom7 = qualityDecay('dom7', 'ambient');
    const maj = qualityDecay('maj', 'ambient');
    expect(dom7).toBeLessThan(maj);
  });

  it('stays in 0.7-1.4 range', () => {
    const qualities = ['maj', 'min', 'maj7', 'min7', 'dom7', 'sus2', 'sus4', 'dim', 'aug', 'add9', 'min9'] as const;
    for (const q of qualities) {
      const mul = qualityDecay(q, 'ambient');
      expect(mul).toBeGreaterThanOrEqual(0.7);
      expect(mul).toBeLessThanOrEqual(1.4);
    }
  });

  it('low-sensitivity mood varies less', () => {
    const blockheadMaj = qualityDecay('maj', 'blockhead');
    const avrilMaj = qualityDecay('maj', 'avril');
    expect(Math.abs(avrilMaj - 1.0)).toBeGreaterThan(Math.abs(blockheadMaj - 1.0));
  });
});

describe('qualitySensitivity', () => {
  it('ambient is highest', () => {
    expect(qualitySensitivity('ambient')).toBe(0.60);
  });

  it('blockhead is low', () => {
    expect(qualitySensitivity('blockhead')).toBe(0.20);
  });
});
