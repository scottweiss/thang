import { describe, it, expect } from 'vitest';
import {
  targetVoiceCount,
  thinVoicing,
  shouldApplyVoicingDensity,
  densitySensitivity,
} from './voicing-density';

describe('targetVoiceCount', () => {
  it('peak high tension = many voices', () => {
    const count = targetVoiceCount('trance', 'peak', 0.9);
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it('breakdown low tension = few voices', () => {
    const count = targetVoiceCount('trance', 'breakdown', 0.1);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('increases with tension', () => {
    const low = targetVoiceCount('avril', 'build', 0.1);
    const high = targetVoiceCount('avril', 'build', 0.9);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it('clamps to 2-6', () => {
    expect(targetVoiceCount('trance', 'peak', 1.0)).toBeLessThanOrEqual(6);
    expect(targetVoiceCount('ambient', 'breakdown', 0.0)).toBeGreaterThanOrEqual(2);
  });

  it('ambient has minimal variation', () => {
    const low = targetVoiceCount('ambient', 'groove', 0.1);
    const high = targetVoiceCount('ambient', 'groove', 0.9);
    expect(high - low).toBeLessThanOrEqual(1);
  });
});

describe('thinVoicing', () => {
  it('returns unchanged if already at target', () => {
    const notes = ['C3', 'E3', 'G3'];
    expect(thinVoicing(notes, 3)).toEqual(notes);
  });

  it('returns unchanged if below target', () => {
    const notes = ['C3', 'G3'];
    expect(thinVoicing(notes, 4)).toEqual(notes);
  });

  it('removes middle voices', () => {
    const notes = ['C3', 'E3', 'G3', 'B3', 'D4'];
    const result = thinVoicing(notes, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('C3');  // bass kept
    expect(result[result.length - 1]).toBe('D4'); // soprano kept
  });

  it('never goes below 2 notes', () => {
    const notes = ['C3', 'E3', 'G3', 'B3'];
    const result = thinVoicing(notes, 1);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('shouldApplyVoicingDensity', () => {
  it('trance = yes', () => {
    expect(shouldApplyVoicingDensity('trance')).toBe(true);
  });

  it('ambient = no', () => {
    expect(shouldApplyVoicingDensity('ambient')).toBe(false);
  });
});

describe('densitySensitivity', () => {
  it('trance has highest', () => {
    expect(densitySensitivity('trance')).toBe(0.55);
  });

  it('ambient has lowest', () => {
    expect(densitySensitivity('ambient')).toBe(0.08);
  });
});
