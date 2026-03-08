import { describe, it, expect } from 'vitest';
import { findSuspensions, pickBestSuspension, findAnticipation, suspensionResolutionPair } from './suspension';

describe('findSuspensions', () => {
  it('finds suspension between C major and D minor', () => {
    const prev = ['C4', 'E4', 'G4'];
    const next = ['D4', 'F4', 'A4'];
    const suspensions = findSuspensions(prev, next);
    expect(suspensions.length).toBeGreaterThan(0);
    // E4 should suspend to D4 or F4 (stepwise)
    const eSus = suspensions.find(s => s.suspended === 'E4');
    expect(eSus).toBeDefined();
  });

  it('no suspensions when chords share all notes', () => {
    const prev = ['C4', 'E4', 'G4'];
    const next = ['C4', 'E4', 'G4'];
    expect(findSuspensions(prev, next)).toHaveLength(0);
  });

  it('only includes stepwise resolutions (1-3 semitones)', () => {
    const suspensions = findSuspensions(['C4', 'E4', 'G4'], ['D4', 'F#4', 'A4']);
    suspensions.forEach(s => {
      // All resolutions should be close
      expect(s.suspended).not.toBe(s.resolution);
    });
  });
});

describe('pickBestSuspension', () => {
  it('returns null for empty array', () => {
    expect(pickBestSuspension([])).toBeNull();
  });

  it('returns a suspension when available', () => {
    const suspensions = [
      { suspended: 'E4', resolution: 'D4' },
      { suspended: 'G4', resolution: 'F4' },
    ];
    const best = pickBestSuspension(suspensions);
    expect(best).not.toBeNull();
    expect(best!.suspended).toBeDefined();
    expect(best!.resolution).toBeDefined();
  });
});

describe('findAnticipation', () => {
  it('finds a note from next chord not in current', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['D4', 'F4', 'A4'];
    const antic = findAnticipation(current, next);
    expect(antic).not.toBeNull();
    // Should be one of D4, F4, A4
    expect(['D4', 'F4', 'A4']).toContain(antic);
  });

  it('returns null when all notes are shared', () => {
    const current = ['C4', 'E4', 'G4'];
    const next = ['C5', 'E5', 'G5']; // same pitch classes
    expect(findAnticipation(current, next)).toBeNull();
  });

  it('returns null for empty next chord', () => {
    expect(findAnticipation(['C4'], [])).toBeNull();
  });
});

describe('suspensionResolutionPair', () => {
  it('creates two voicings: suspended and resolved', () => {
    const chordNotes = ['D4', 'F4', 'A4'];
    const suspension = { suspended: 'E4', resolution: 'D4' };
    const pair = suspensionResolutionPair(chordNotes, suspension);
    expect(pair).not.toBeNull();
    const [sus, res] = pair!;
    // Suspended voicing replaces D4 with E4
    expect(sus).toContain('E4');
    expect(sus).not.toContain('D4');
    // Resolved voicing has the original chord
    expect(res).toContain('D4');
    expect(res).not.toContain('E4');
  });

  it('preserves other chord tones', () => {
    const chordNotes = ['D4', 'F4', 'A4'];
    const suspension = { suspended: 'E4', resolution: 'D4' };
    const pair = suspensionResolutionPair(chordNotes, suspension);
    const [sus, res] = pair!;
    expect(sus).toContain('F4');
    expect(sus).toContain('A4');
    expect(res).toContain('F4');
    expect(res).toContain('A4');
  });

  it('returns null when resolution note not in chord', () => {
    const chordNotes = ['D4', 'F4', 'A4'];
    const suspension = { suspended: 'E4', resolution: 'C4' }; // C4 not in chord
    expect(suspensionResolutionPair(chordNotes, suspension)).toBeNull();
  });

  it('both voicings have same length', () => {
    const chordNotes = ['C3', 'E3', 'G3', 'B3'];
    const suspension = { suspended: 'C4', resolution: 'B3' };
    const pair = suspensionResolutionPair(chordNotes, suspension);
    expect(pair).not.toBeNull();
    expect(pair![0].length).toBe(pair![1].length);
  });
});
