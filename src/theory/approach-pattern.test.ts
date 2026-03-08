import { describe, it, expect } from 'vitest';
import {
  selectApproachType,
  approachOffset,
  shouldApplyApproach,
  approachTendency,
} from './approach-pattern';

describe('selectApproachType', () => {
  it('returns a valid approach type', () => {
    const valid = ['chromatic', 'diatonic', 'enclosure', 'direct'];
    for (let t = 0; t < 20; t++) {
      expect(valid).toContain(selectApproachType('lofi', t));
    }
  });

  it('trance mostly selects direct', () => {
    let directCount = 0;
    for (let t = 0; t < 50; t++) {
      if (selectApproachType('trance', t) === 'direct') directCount++;
    }
    expect(directCount).toBeGreaterThan(20);
  });

  it('lofi sometimes uses enclosure', () => {
    let encCount = 0;
    for (let t = 0; t < 100; t++) {
      if (selectApproachType('lofi', t) === 'enclosure') encCount++;
    }
    expect(encCount).toBeGreaterThan(0);
  });
});

describe('approachOffset', () => {
  it('chromatic steps by 1', () => {
    expect(approachOffset('chromatic', 3)).toBe(1);
    expect(approachOffset('chromatic', -3)).toBe(-1);
  });

  it('diatonic steps by 2', () => {
    expect(approachOffset('diatonic', 4)).toBe(2);
    expect(approachOffset('diatonic', -4)).toBe(-2);
  });

  it('diatonic falls back to 1 for small distance', () => {
    expect(approachOffset('diatonic', 1)).toBe(1);
  });

  it('enclosure returns 1 for above approach', () => {
    expect(approachOffset('enclosure', 3)).toBe(1);
  });

  it('direct returns 0', () => {
    expect(approachOffset('direct', 5)).toBe(0);
  });

  it('zero distance = no offset', () => {
    expect(approachOffset('chromatic', 0)).toBe(0);
  });
});

describe('shouldApplyApproach', () => {
  it('lofi in groove applies', () => {
    expect(shouldApplyApproach('lofi', 'groove')).toBe(true);
  });

  it('ambient in intro does not', () => {
    // 0.10 * 0.5 = 0.05 < 0.12
    expect(shouldApplyApproach('ambient', 'intro')).toBe(false);
  });
});

describe('approachTendency', () => {
  it('lofi is highest', () => {
    expect(approachTendency('lofi')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(approachTendency('ambient')).toBe(0.10);
  });
});
