import { describe, it, expect } from 'vitest';
import {
  subsonicGainBoost,
  subsonicRoomBoost,
  shouldApplySubsonicPulse,
  pulseIntensity,
} from './subsonic-pulse';

describe('subsonicGainBoost', () => {
  it('1.0 with no drum activity', () => {
    expect(subsonicGainBoost(0, 'trance', 'peak')).toBe(1.0);
  });

  it('> 1.0 with high drum activity', () => {
    expect(subsonicGainBoost(0.8, 'trance', 'peak')).toBeGreaterThan(1.0);
  });

  it('capped at 1.15', () => {
    expect(subsonicGainBoost(1.0, 'blockhead', 'peak')).toBeLessThanOrEqual(1.15);
  });

  it('peaks are strongest', () => {
    const peak = subsonicGainBoost(0.7, 'trance', 'peak');
    const bd = subsonicGainBoost(0.7, 'trance', 'breakdown');
    expect(peak).toBeGreaterThan(bd);
  });
});

describe('subsonicRoomBoost', () => {
  it('> 1.0 with drum activity', () => {
    expect(subsonicRoomBoost(0.8, 'blockhead', 'peak')).toBeGreaterThan(1.0);
  });

  it('capped at 1.2', () => {
    expect(subsonicRoomBoost(1.0, 'blockhead', 'peak')).toBeLessThanOrEqual(1.2);
  });
});

describe('shouldApplySubsonicPulse', () => {
  it('true for trance peak with drums', () => {
    expect(shouldApplySubsonicPulse('trance', 'peak', true)).toBe(true);
  });

  it('false without drums', () => {
    expect(shouldApplySubsonicPulse('trance', 'peak', false)).toBe(false);
  });

  it('false for ambient breakdown (too weak)', () => {
    expect(shouldApplySubsonicPulse('ambient', 'breakdown', true)).toBe(false);
  });
});

describe('pulseIntensity', () => {
  it('blockhead is strongest', () => {
    expect(pulseIntensity('blockhead')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(pulseIntensity('ambient')).toBe(0.05);
  });
});
