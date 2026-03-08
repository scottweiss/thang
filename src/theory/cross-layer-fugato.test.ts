import { describe, it, expect } from 'vitest';
import {
  shouldApplyFugato,
  fugatoEntryDelay,
  fugatoOctaveOffset,
  transposeMotif,
  fugatoIntensity,
} from './cross-layer-fugato';

describe('shouldApplyFugato', () => {
  it('true at section change during build with strong mood', () => {
    expect(shouldApplyFugato(10, 'avril', 'build', true)).toBe(true);
  });

  it('false without section change', () => {
    expect(shouldApplyFugato(10, 'avril', 'build', false)).toBe(false);
  });

  it('false for ambient intro (too weak)', () => {
    // ambient=0.10 * intro=0.3 = 0.03 < 0.15
    expect(shouldApplyFugato(10, 'ambient', 'intro', true)).toBe(false);
  });
});

describe('fugatoEntryDelay', () => {
  it('melody enters first (delay 0)', () => {
    expect(fugatoEntryDelay('melody', 'avril')).toBe(0);
  });

  it('arp enters second (delay 1)', () => {
    expect(fugatoEntryDelay('arp', 'avril')).toBe(1);
  });

  it('harmony enters third (delay 2)', () => {
    expect(fugatoEntryDelay('harmony', 'avril')).toBe(2);
  });

  it('-1 for non-participating layers', () => {
    expect(fugatoEntryDelay('drone', 'avril')).toBe(-1);
    expect(fugatoEntryDelay('texture', 'avril')).toBe(-1);
  });

  it('low intensity excludes later entries', () => {
    // ambient=0.10 — only melody participates
    expect(fugatoEntryDelay('melody', 'ambient')).toBe(0);
    expect(fugatoEntryDelay('arp', 'ambient')).toBe(-1);
    expect(fugatoEntryDelay('harmony', 'ambient')).toBe(-1);
  });
});

describe('fugatoOctaveOffset', () => {
  it('melody at concert pitch', () => {
    expect(fugatoOctaveOffset('melody')).toBe(0);
  });

  it('harmony down one octave', () => {
    expect(fugatoOctaveOffset('harmony')).toBe(-1);
  });

  it('0 for unknown layers', () => {
    expect(fugatoOctaveOffset('texture')).toBe(0);
  });
});

describe('transposeMotif', () => {
  it('transposes up by 12 semitones (one octave)', () => {
    expect(transposeMotif(['C4', 'E4', 'G4'], 12)).toEqual(['C5', 'E5', 'G5']);
  });

  it('transposes down by 12 semitones', () => {
    expect(transposeMotif(['C4', 'E4', 'G4'], -12)).toEqual(['C3', 'E3', 'G3']);
  });

  it('preserves rests', () => {
    expect(transposeMotif(['C4', '~', 'G4'], 7)).toEqual(['G4', '~', 'D5']);
  });

  it('handles sharps correctly', () => {
    expect(transposeMotif(['C#4'], 1)).toEqual(['D4']);
  });

  it('wraps around octave boundaries', () => {
    expect(transposeMotif(['B3'], 1)).toEqual(['C4']);
  });
});

describe('fugatoIntensity', () => {
  it('avril is strong', () => {
    expect(fugatoIntensity('avril')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(fugatoIntensity('ambient')).toBe(0.10);
  });
});
