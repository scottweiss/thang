import { describe, it, expect } from 'vitest';
import {
  bloomMultiplier,
  bloomLpfMultiplier,
  bloomRoomMultiplier,
  shouldApplyBloom,
  bloomRate,
} from './harmonic-bloom';

describe('bloomMultiplier', () => {
  it('tick 0 = no bloom', () => {
    expect(bloomMultiplier(0, 'lofi', 'groove')).toBeCloseTo(1.0, 1);
  });

  it('increases with time', () => {
    const t1 = bloomMultiplier(1, 'lofi', 'groove');
    const t5 = bloomMultiplier(5, 'lofi', 'groove');
    expect(t5).toBeGreaterThan(t1);
  });

  it('capped at 1.5', () => {
    expect(bloomMultiplier(100, 'ambient', 'breakdown')).toBeLessThanOrEqual(1.5);
  });

  it('trance has minimal bloom', () => {
    const trance = bloomMultiplier(5, 'trance', 'groove');
    const lofi = bloomMultiplier(5, 'lofi', 'groove');
    expect(trance).toBeLessThan(lofi);
  });

  it('breakdown amplifies bloom', () => {
    const bd = bloomMultiplier(3, 'lofi', 'breakdown');
    const pk = bloomMultiplier(3, 'lofi', 'peak');
    expect(bd).toBeGreaterThan(pk);
  });
});

describe('bloomLpfMultiplier', () => {
  it('starts at 1.0', () => {
    expect(bloomLpfMultiplier(0, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('increases over time', () => {
    expect(bloomLpfMultiplier(5, 'lofi')).toBeGreaterThan(1.0);
  });

  it('capped at 1.3', () => {
    expect(bloomLpfMultiplier(100, 'ambient')).toBeLessThanOrEqual(1.3);
  });
});

describe('bloomRoomMultiplier', () => {
  it('starts at 1.0', () => {
    expect(bloomRoomMultiplier(0, 'xtal')).toBeCloseTo(1.0, 1);
  });

  it('increases over time', () => {
    expect(bloomRoomMultiplier(5, 'xtal')).toBeGreaterThan(1.0);
  });

  it('capped at 1.4', () => {
    expect(bloomRoomMultiplier(100, 'ambient')).toBeLessThanOrEqual(1.4);
  });
});

describe('shouldApplyBloom', () => {
  it('lofi applies', () => {
    expect(shouldApplyBloom('lofi')).toBe(true);
  });

  it('trance does not', () => {
    // 0.10 < 0.12
    expect(shouldApplyBloom('trance')).toBe(false);
  });
});

describe('bloomRate', () => {
  it('ambient is high', () => {
    expect(bloomRate('ambient')).toBe(0.55);
  });

  it('trance is lowest', () => {
    expect(bloomRate('trance')).toBe(0.10);
  });
});
