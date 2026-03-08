import { describe, it, expect } from 'vitest';
import {
  driftAmount,
  driftDirection,
  shouldDrift,
  driftRate,
} from './tonal-center-drift';

describe('driftAmount', () => {
  it('returns 0-6 range', () => {
    for (let tick = 0; tick < 100; tick++) {
      const d = driftAmount(tick, 'ambient', 'breakdown');
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it('varies over time', () => {
    const values = new Set<number>();
    for (let tick = 0; tick < 50; tick++) {
      values.add(Math.round(driftAmount(tick, 'ambient', 'breakdown') * 10));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('ambient drifts more than trance', () => {
    let ambientTotal = 0;
    let tranceTotal = 0;
    for (let tick = 0; tick < 100; tick++) {
      ambientTotal += driftAmount(tick, 'ambient', 'groove');
      tranceTotal += driftAmount(tick, 'trance', 'groove');
    }
    expect(ambientTotal).toBeGreaterThan(tranceTotal);
  });
});

describe('driftDirection', () => {
  it('returns 1 or -1', () => {
    for (let tick = 0; tick < 50; tick++) {
      const dir = driftDirection(tick, 'lofi');
      expect(dir === 1 || dir === -1).toBe(true);
    }
  });
});

describe('shouldDrift', () => {
  it('true for ambient breakdown', () => {
    expect(shouldDrift('ambient', 'breakdown')).toBe(true);
  });

  it('false for disco intro', () => {
    expect(shouldDrift('disco', 'intro')).toBe(false);
  });
});

describe('driftRate', () => {
  it('ambient is highest', () => {
    expect(driftRate('ambient')).toBe(0.40);
  });

  it('disco is lowest', () => {
    expect(driftRate('disco')).toBe(0.03);
  });
});
