import { describe, it, expect } from 'vitest';
import {
  downbeatAnchorGain,
  anchorStrength,
} from './rhythmic-downbeat-anchor';

describe('downbeatAnchorGain', () => {
  it('downbeat gets boost', () => {
    const gain = downbeatAnchorGain(0, 'trance', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('half-bar gets smaller boost', () => {
    const down = downbeatAnchorGain(0, 'trance', 'groove');
    const half = downbeatAnchorGain(8, 'trance', 'groove');
    expect(half).toBeGreaterThan(1.0);
    expect(down).toBeGreaterThan(half);
  });

  it('off-beat is neutral', () => {
    const gain = downbeatAnchorGain(3, 'trance', 'groove');
    expect(gain).toBe(1.0);
  });

  it('trance anchors more than ambient', () => {
    const tr = downbeatAnchorGain(0, 'trance', 'groove');
    const amb = downbeatAnchorGain(0, 'ambient', 'groove');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = downbeatAnchorGain(p, 'trance', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('anchorStrength', () => {
  it('trance is high', () => {
    expect(anchorStrength('trance')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(anchorStrength('ambient')).toBe(0.10);
  });
});
