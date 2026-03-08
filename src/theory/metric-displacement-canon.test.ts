import { describe, it, expect } from 'vitest';
import {
  canonDisplacement,
  shouldApplyCanonDisplacement,
  canonDisplacementStrength,
} from './metric-displacement-canon';

describe('canonDisplacement', () => {
  it('drone gets zero delay (enters first)', () => {
    expect(canonDisplacement('drone', 'lofi', 'build')).toBe(0);
  });

  it('later layers get more delay', () => {
    const harmony = canonDisplacement('harmony', 'lofi', 'build');
    const arp = canonDisplacement('arp', 'lofi', 'build');
    expect(arp).toBeGreaterThan(harmony);
  });

  it('ambient has more displacement than trance', () => {
    const ambient = canonDisplacement('melody', 'ambient', 'build');
    const trance = canonDisplacement('melody', 'trance', 'build');
    expect(ambient).toBeGreaterThan(trance);
  });

  it('intro section has more stagger than peak', () => {
    const intro = canonDisplacement('arp', 'lofi', 'intro');
    const peak = canonDisplacement('arp', 'lofi', 'peak');
    expect(intro).toBeGreaterThan(peak);
  });

  it('stays under 0.5s', () => {
    expect(canonDisplacement('atmosphere', 'ambient', 'intro')).toBeLessThanOrEqual(0.5);
  });

  it('stays non-negative', () => {
    expect(canonDisplacement('drone', 'trance', 'peak')).toBeGreaterThanOrEqual(0);
  });
});

describe('shouldApplyCanonDisplacement', () => {
  it('true at section boundary for ambient', () => {
    expect(shouldApplyCanonDisplacement('ambient', 'build', 0)).toBe(true);
  });

  it('false after 3 ticks', () => {
    expect(shouldApplyCanonDisplacement('ambient', 'build', 3)).toBe(false);
  });

  it('false for disco at peak', () => {
    expect(shouldApplyCanonDisplacement('disco', 'peak', 0)).toBe(false);
  });
});

describe('canonDisplacementStrength', () => {
  it('ambient is high', () => {
    expect(canonDisplacementStrength('ambient')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(canonDisplacementStrength('disco')).toBe(0.08);
  });
});
