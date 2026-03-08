import { describe, it, expect } from 'vitest';
import {
  detectInertiaDirection,
  inertiaBias,
  applyInertiaBias,
  inertiaStrength,
} from './melodic-inertia';

describe('detectInertiaDirection', () => {
  it('detects ascending motion', () => {
    expect(detectInertiaDirection(['C4', 'D4', 'E4'])).toBe('ascending');
  });

  it('detects descending motion', () => {
    expect(detectInertiaDirection(['E4', 'D4', 'C4'])).toBe('descending');
  });

  it('returns static for single note', () => {
    expect(detectInertiaDirection(['C4'])).toBe('static');
  });

  it('returns static for repeated notes', () => {
    expect(detectInertiaDirection(['C4', 'C4', 'C4'])).toBe('static');
  });

  it('handles mixed motion by majority', () => {
    // C4→E4 (up), E4→D4 (down), D4→F4 (up) = 2 up, 1 down
    expect(detectInertiaDirection(['C4', 'E4', 'D4', 'F4'])).toBe('ascending');
  });
});

describe('inertiaBias', () => {
  it('favors ascending notes when direction is ascending', () => {
    const upBias = inertiaBias('E4', 'C4', 'ascending', 'trance');
    const downBias = inertiaBias('A3', 'C4', 'ascending', 'trance');
    expect(upBias).toBeGreaterThan(downBias);
  });

  it('favors descending notes when direction is descending', () => {
    const downBias = inertiaBias('A3', 'C4', 'descending', 'trance');
    const upBias = inertiaBias('E4', 'C4', 'descending', 'trance');
    expect(downBias).toBeGreaterThan(upBias);
  });

  it('returns 1.0 for static direction', () => {
    expect(inertiaBias('E4', 'C4', 'static', 'lofi')).toBe(1.0);
  });

  it('stronger for high-inertia moods', () => {
    const tranceBias = inertiaBias('E4', 'C4', 'ascending', 'trance');
    const syroBias = inertiaBias('E4', 'C4', 'ascending', 'syro');
    expect(tranceBias).toBeGreaterThan(syroBias);
  });
});

describe('applyInertiaBias', () => {
  it('modifies weights based on direction', () => {
    const candidates = [
      { note: 'D4', weight: 1.0 },
      { note: 'B3', weight: 1.0 },
    ];
    const biased = applyInertiaBias(candidates, 'C4', 'ascending', 'trance');
    expect(biased[0].weight).toBeGreaterThan(biased[1].weight);
  });

  it('preserves minimum weight', () => {
    const candidates = [{ note: 'A3', weight: 0.01 }];
    const biased = applyInertiaBias(candidates, 'C4', 'ascending', 'trance');
    expect(biased[0].weight).toBeGreaterThanOrEqual(0.01);
  });
});

describe('inertiaStrength', () => {
  it('avril has highest', () => {
    expect(inertiaStrength('avril')).toBe(0.65);
  });

  it('syro has lowest', () => {
    expect(inertiaStrength('syro')).toBe(0.15);
  });
});
