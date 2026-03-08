import { describe, it, expect } from 'vitest';
import { shouldUsePlaning, planedVoicing } from './harmonic-planing';

describe('planedVoicing', () => {
  it('shifts all notes by the same interval', () => {
    // C major → D major: everything up 2 semitones
    const result = planedVoicing(['C3', 'E3', 'G3'], 'D', 'C');
    expect(result).toEqual(['D3', 'F#3', 'A3']);
  });

  it('handles downward movement', () => {
    // D major → C major: everything down 2 semitones
    const result = planedVoicing(['D3', 'F#3', 'A3'], 'C', 'D');
    expect(result).toEqual(['C3', 'E3', 'G3']);
  });

  it('takes shortest path for large intervals', () => {
    // C → B: should go down 1 semitone (not up 11)
    const result = planedVoicing(['C4', 'E4', 'G4'], 'B', 'C');
    expect(result).toEqual(['B3', 'D#4', 'F#4']);
  });

  it('preserves intervallic structure', () => {
    // Check that intervals between notes are preserved
    const prev = ['C3', 'E3', 'G3', 'B3']; // C major 7: 0,4,7,11
    const result = planedVoicing(prev, 'F', 'C')!;
    // F major 7 shape: F,A,C,E → intervals still 0,4,7,11 from root
    expect(result).toEqual(['F3', 'A3', 'C4', 'E4']);
  });

  it('returns null for same root', () => {
    expect(planedVoicing(['C3', 'E3', 'G3'], 'C', 'C')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(planedVoicing([], 'D', 'C')).toBeNull();
  });

  it('handles sharps and flats', () => {
    const result = planedVoicing(['F#3', 'A#3', 'C#4'], 'G', 'F#');
    expect(result).toEqual(['G3', 'B3', 'D4']);
  });

  it('wraps octaves correctly', () => {
    // B → C: up 1 semitone, B4 wraps to C5
    const result = planedVoicing(['B4', 'D#5', 'F#5'], 'C', 'B');
    expect(result).toEqual(['C5', 'E5', 'G5']);
  });
});

describe('shouldUsePlaning', () => {
  it('ambient has higher probability than trance', () => {
    let ambientCount = 0;
    let tranceCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (shouldUsePlaning('ambient', 'breakdown')) ambientCount++;
      if (shouldUsePlaning('trance', 'peak')) tranceCount++;
    }
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });

  it('breakdown section increases planing probability', () => {
    let breakdownCount = 0;
    let peakCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (shouldUsePlaning('xtal', 'breakdown')) breakdownCount++;
      if (shouldUsePlaning('xtal', 'peak')) peakCount++;
    }
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});
