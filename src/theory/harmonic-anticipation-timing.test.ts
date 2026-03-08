import { describe, it, expect } from 'vitest';
import {
  anticipationOffset,
  anticipationAmount,
} from './harmonic-anticipation-timing';

describe('anticipationOffset', () => {
  it('drone gets negative offset (early)', () => {
    const offset = anticipationOffset('drone', 'lofi', 'groove');
    expect(offset).toBeLessThan(0);
  });

  it('melody gets no offset', () => {
    expect(anticipationOffset('melody', 'lofi', 'groove')).toBe(0);
  });

  it('arp gets no offset', () => {
    expect(anticipationOffset('arp', 'ambient', 'build')).toBe(0);
  });

  it('drone leads more than harmony', () => {
    const drone = anticipationOffset('drone', 'lofi', 'groove');
    const harmony = anticipationOffset('harmony', 'lofi', 'groove');
    expect(drone).toBeLessThan(harmony); // more negative = more early
  });

  it('breakdown has more anticipation', () => {
    const groove = anticipationOffset('drone', 'ambient', 'groove');
    const breakdown = anticipationOffset('drone', 'ambient', 'breakdown');
    expect(breakdown).toBeLessThan(groove); // more negative
  });

  it('stays reasonable (> -0.2s)', () => {
    const offset = anticipationOffset('drone', 'ambient', 'breakdown');
    expect(offset).toBeGreaterThan(-0.2);
  });
});

describe('anticipationAmount', () => {
  it('ambient is high', () => {
    expect(anticipationAmount('ambient')).toBe(0.12);
  });

  it('trance is low', () => {
    expect(anticipationAmount('trance')).toBe(0.02);
  });
});
