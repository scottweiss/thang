import { describe, it, expect } from 'vitest';
import {
  sidechainGainPattern,
  shouldDuckLayer,
  shouldApplySidechainDuck,
} from './sidechain-duck';

describe('sidechainGainPattern', () => {
  it('trance peak has pronounced ducking', () => {
    const gains = sidechainGainPattern(16, 'trance', 'peak');
    // Beat 1 (step 0) should be ducked
    expect(gains[0]).toBeLessThan(0.75);
    // Mid-recovery should be between ducked and full
    expect(gains[4]).toBeGreaterThan(gains[0]);
    expect(gains[4]).toBeLessThan(1.0);
  });

  it('ambient has no ducking', () => {
    const gains = sidechainGainPattern(16, 'ambient', 'peak');
    expect(gains.every(g => g === 1.0)).toBe(true);
  });

  it('gains recover toward 1.0', () => {
    const gains = sidechainGainPattern(8, 'trance', 'peak');
    // Step 0 is ducked, subsequent steps should increase
    expect(gains[1]).toBeGreaterThan(gains[0]);
    expect(gains[2]).toBeGreaterThan(gains[1]);
  });

  it('ducks on both beats 1 and 3', () => {
    const gains = sidechainGainPattern(8, 'disco', 'peak');
    // Step 0 (beat 1) ducked
    expect(gains[0]).toBeLessThan(0.85);
    // Step 4 (beat 3) ducked
    expect(gains[4]).toBeLessThan(0.85);
  });

  it('returns correct length', () => {
    expect(sidechainGainPattern(8, 'trance', 'peak')).toHaveLength(8);
    expect(sidechainGainPattern(16, 'trance', 'peak')).toHaveLength(16);
  });

  it('breakdown is much subtler than peak', () => {
    const peak = sidechainGainPattern(8, 'trance', 'peak');
    const breakdown = sidechainGainPattern(8, 'trance', 'breakdown');
    // Peak should duck more (lower gain at step 0)
    expect(peak[0]).toBeLessThan(breakdown[0]);
  });

  it('all gains are between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        const gains = sidechainGainPattern(16, mood, section);
        for (const g of gains) {
          expect(g).toBeGreaterThanOrEqual(0);
          expect(g).toBeLessThanOrEqual(1.0);
        }
      }
    }
  });
});

describe('shouldDuckLayer', () => {
  it('ducks drone, harmony, arp, atmosphere', () => {
    expect(shouldDuckLayer('drone')).toBe(true);
    expect(shouldDuckLayer('harmony')).toBe(true);
    expect(shouldDuckLayer('arp')).toBe(true);
    expect(shouldDuckLayer('atmosphere')).toBe(true);
  });

  it('does not duck melody or texture', () => {
    expect(shouldDuckLayer('melody')).toBe(false);
    expect(shouldDuckLayer('texture')).toBe(false);
  });
});

describe('shouldApplySidechainDuck', () => {
  it('true for trance peak', () => {
    expect(shouldApplySidechainDuck('trance', 'peak')).toBe(true);
  });

  it('false for ambient', () => {
    expect(shouldApplySidechainDuck('ambient', 'peak')).toBe(false);
  });

  it('false for trance breakdown (depth * 0.2 < 0.03)', () => {
    // trance depth = 0.35, breakdown mult = 0.2 → 0.07 >= 0.03
    expect(shouldApplySidechainDuck('trance', 'breakdown')).toBe(true);
  });

  it('false for avril intro (depth 0.03 * 0.3 < 0.03)', () => {
    expect(shouldApplySidechainDuck('avril', 'intro')).toBe(false);
  });
});
