import { describe, it, expect } from 'vitest';
import {
  shouldArpAnticipate,
  blendNextChordTones,
  arpAnticipationStrength,
} from './arp-anticipation';

describe('shouldArpAnticipate', () => {
  it('false without next hint', () => {
    expect(shouldArpAnticipate('lofi', 5, false)).toBe(false);
  });

  it('false when chord just changed', () => {
    expect(shouldArpAnticipate('lofi', 1, true)).toBe(false);
  });

  it('lofi has reasonable probability', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldArpAnticipate('lofi', 5, true)) count++;
    }
    // lofi strength = 0.50 → ~50%
    expect(count).toBeGreaterThan(70);
    expect(count).toBeLessThan(130);
  });

  it('ambient rarely anticipates', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldArpAnticipate('ambient', 5, true)) count++;
    }
    expect(count).toBeLessThan(25);
  });
});

describe('blendNextChordTones', () => {
  it('adds novel tones from next chord', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['F4', 'A4', 'C5'];
    const blended = blendNextChordTones(current, next, 'lofi');
    expect(blended.length).toBeGreaterThan(current.length);
    // Should contain original notes
    expect(blended).toContain('C4');
    expect(blended).toContain('E4');
    expect(blended).toContain('G4');
  });

  it('does not add duplicate note names', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['C5', 'E5', 'G5']; // Same note names, different octaves
    const blended = blendNextChordTones(current, next, 'lofi');
    // All next notes share names with current — nothing new to add
    expect(blended.length).toBe(current.length);
  });

  it('adds octave to bare note names', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['F', 'A']; // No octave
    const blended = blendNextChordTones(current, next, 'lofi');
    // Should have added F4 and A4
    expect(blended.some(n => n.startsWith('F'))).toBe(true);
    expect(blended.some(n => /\d$/.test(n))).toBe(true);
  });

  it('returns current notes when next is empty', () => {
    const current = ['C4', 'E4'];
    const blended = blendNextChordTones(current, [], 'lofi');
    expect(blended).toEqual(current);
  });

  it('high-strength moods add 2 notes', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['D4', 'F4', 'A4', 'C5']; // All novel
    const blended = blendNextChordTones(current, next, 'lofi'); // strength 0.50 > 0.3
    expect(blended.length).toBe(5); // 3 original + 2 new
  });

  it('low-strength moods add 1 note', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['D4', 'F4', 'A4']; // All novel
    const blended = blendNextChordTones(current, next, 'trance'); // strength 0.10 < 0.3
    expect(blended.length).toBe(4); // 3 original + 1 new
  });
});

describe('arpAnticipationStrength', () => {
  it('lofi is strongest', () => {
    expect(arpAnticipationStrength('lofi')).toBe(0.50);
  });

  it('ambient is weakest', () => {
    expect(arpAnticipationStrength('ambient')).toBe(0.05);
  });
});
