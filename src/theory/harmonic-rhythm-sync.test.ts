import { describe, it, expect } from 'vitest';
import {
  chordChangeAlignment,
  chordChangeNudge,
  harmonicRhythmSyncStrength,
} from './harmonic-rhythm-sync';

describe('chordChangeAlignment', () => {
  it('beat 1 has highest alignment for trance', () => {
    const beat1 = chordChangeAlignment(0, 'trance');
    const beat2 = chordChangeAlignment(1, 'trance');
    expect(beat1).toBeGreaterThan(beat2);
  });

  it('beat 3 is secondary strong', () => {
    const beat3 = chordChangeAlignment(2, 'trance');
    const beat2 = chordChangeAlignment(1, 'trance');
    expect(beat3).toBeGreaterThan(beat2);
  });

  it('stays in 0-1 range', () => {
    for (let b = 0; b < 4; b++) {
      const a = chordChangeAlignment(b, 'ambient');
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(1);
    }
  });

  it('syro has more uniform alignment', () => {
    const syro1 = chordChangeAlignment(0, 'syro');
    const syro2 = chordChangeAlignment(1, 'syro');
    const trance1 = chordChangeAlignment(0, 'trance');
    const trance2 = chordChangeAlignment(1, 'trance');
    // Syro should have less difference between beats
    expect(Math.abs(syro1 - syro2)).toBeLessThan(Math.abs(trance1 - trance2));
  });
});

describe('chordChangeNudge', () => {
  it('nudges toward nearest strong beat', () => {
    // At beat 0.5, nearest strong is 0, so nudge should be negative
    const nudge = chordChangeNudge(0.5, 'trance');
    expect(nudge).toBeLessThan(0);
  });

  it('no nudge on strong beat', () => {
    const nudge = chordChangeNudge(0, 'trance');
    expect(nudge).toBeCloseTo(0, 1);
  });

  it('stays in -0.5 to 0.5 range', () => {
    for (let b = 0; b < 4; b += 0.5) {
      const n = chordChangeNudge(b, 'trance');
      expect(n).toBeGreaterThanOrEqual(-0.5);
      expect(n).toBeLessThanOrEqual(0.5);
    }
  });
});

describe('harmonicRhythmSyncStrength', () => {
  it('trance is highest', () => {
    expect(harmonicRhythmSyncStrength('trance')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(harmonicRhythmSyncStrength('syro')).toBe(0.15);
  });
});
