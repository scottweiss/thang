import { describe, it, expect } from 'vitest';
import {
  chordTimingOffset,
  shouldApplyChordTiming,
  chordSpread,
} from './chord-anticipation-delay';

describe('chordTimingOffset', () => {
  it('harmony has zero offset', () => {
    expect(chordTimingOffset('harmony', 'lofi', 'groove')).toBe(0);
  });

  it('arp is late', () => {
    const offset = chordTimingOffset('arp', 'lofi', 'groove');
    expect(offset).toBeGreaterThan(0);
  });

  it('texture is early', () => {
    const offset = chordTimingOffset('texture', 'lofi', 'groove');
    expect(offset).toBeLessThan(0);
  });

  it('trance has tight spread', () => {
    const arp = Math.abs(chordTimingOffset('arp', 'trance', 'groove'));
    expect(arp).toBeLessThan(0.02);
  });

  it('ambient has wide spread', () => {
    const arp = Math.abs(chordTimingOffset('arp', 'ambient', 'groove'));
    expect(arp).toBeGreaterThan(0.03);
  });

  it('breakdown is loosest', () => {
    const bdArp = Math.abs(chordTimingOffset('arp', 'lofi', 'breakdown'));
    const pkArp = Math.abs(chordTimingOffset('arp', 'lofi', 'peak'));
    expect(bdArp).toBeGreaterThan(pkArp);
  });
});

describe('shouldApplyChordTiming', () => {
  it('lofi applies', () => {
    expect(shouldApplyChordTiming('lofi', 'groove')).toBe(true);
  });

  it('trance does not', () => {
    expect(shouldApplyChordTiming('trance', 'groove')).toBe(false);
  });
});

describe('chordSpread', () => {
  it('ambient is widest', () => {
    expect(chordSpread('ambient')).toBe(0.12);
  });

  it('trance is tightest', () => {
    expect(chordSpread('trance')).toBe(0.02);
  });
});
