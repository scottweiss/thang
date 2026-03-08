import { describe, it, expect } from 'vitest';
import { isBackbeat, backbeatGain } from './rhythmic-backbeat-emphasis';

describe('rhythmic-backbeat-emphasis', () => {
  describe('isBackbeat', () => {
    it('beat 0 (beat 1) is not backbeat', () => {
      expect(isBackbeat(0)).toBe(false);
    });

    it('beat 1 (beat 2) is backbeat', () => {
      expect(isBackbeat(1)).toBe(true);
    });

    it('beat 2 (beat 3) is not backbeat', () => {
      expect(isBackbeat(2)).toBe(false);
    });

    it('beat 3 (beat 4) is backbeat', () => {
      expect(isBackbeat(3)).toBe(true);
    });

    it('wraps around bar boundaries', () => {
      expect(isBackbeat(4)).toBe(false); // beat 1 of bar 2
      expect(isBackbeat(5)).toBe(true);  // beat 2 of bar 2
    });

    it('handles negative positions', () => {
      expect(isBackbeat(-1)).toBe(true); // wraps to beat 4
      expect(isBackbeat(-2)).toBe(false); // wraps to beat 3
    });
  });

  describe('backbeatGain', () => {
    it('boosts gain on backbeats for groove moods', () => {
      const gain = backbeatGain(1, 'disco', 'peak');
      expect(gain).toBeGreaterThan(1);
    });

    it('slightly reduces gain on downbeats for groove moods', () => {
      const gain = backbeatGain(0, 'disco', 'peak');
      expect(gain).toBeLessThan(1);
    });

    it('returns 1 for ambient mood', () => {
      const gain = backbeatGain(1, 'ambient', 'peak');
      expect(gain).toBe(1);
    });

    it('stronger boost for blockhead than flim', () => {
      const blockhead = backbeatGain(1, 'blockhead', 'groove');
      const flim = backbeatGain(1, 'flim', 'groove');
      expect(blockhead).toBeGreaterThan(flim);
    });

    it('weaker effect during breakdown', () => {
      const peak = backbeatGain(1, 'disco', 'peak');
      const breakdown = backbeatGain(1, 'disco', 'breakdown');
      expect(peak - 1).toBeGreaterThan(breakdown - 1);
    });
  });
});
