import { describe, it, expect } from 'vitest';
import { adaptMelodyToChord, adaptArpToChord, adaptDroneToChord, extractNotes } from './phrase-persistence';

describe('phrase persistence integration', () => {
  it('melody adaptation preserves most notes on similar chord', () => {
    const pattern = 'note("C4 E4 ~ G4 B4 ~ D5 ~").sound("sine").gain(0.1)';
    // Move from C major to A minor (A C E) — C and E are shared chord tones
    const adapted = adaptMelodyToChord(pattern, ['A', 'C', 'E']);
    // C4 is chord tone (keep), E4 is chord tone (keep)
    // G4: check if it clashes with Am (A=9, C=0, E=4; G=7, dist to A=2, C=5, E=3 → min=2 → clash)
    // B4: dist to C=1 → not a clash (neighbor)
    // D5: dist to C=2, E=2, A=5 → min=2 → clash
    expect(adapted).toContain('C4');
    expect(adapted).toContain('E4');
    expect(adapted).not.toContain('G4'); // G clashes → gets nudged
    expect(adapted).toContain('B4'); // B is neighbor to C → kept
  });

  it('arp adaptation rotates all chord tones', () => {
    const pattern = 'note("C4 E4 G4 C5 ~ ~ ~ ~").sound("square").gain(0.1)';
    const adapted = adaptArpToChord(pattern, ['C', 'E', 'G'], ['D', 'F#', 'A']);
    const notes = extractNotes(adapted);
    expect(notes[0].note).toBe('D4');
    expect(notes[1].note).toBe('F#4');
    expect(notes[2].note).toBe('A4');
    expect(notes[3].note).toBe('D5');
  });

  it('drone root swap works', () => {
    const pattern = 'note("C2").sound("sine").gain(0.1).lpf(200)';
    const adapted = adaptDroneToChord(pattern, 'C', 'G');
    expect(adapted).toContain('G2');
    expect(adapted).not.toContain('C2');
  });

  it('drone pattern with multiple root occurrences', () => {
    const pattern = 'note("C2 ~ G2 C2").sound("gm_acoustic_bass")';
    const adapted = adaptDroneToChord(pattern, 'C', 'F');
    expect(adapted).toContain('F2');
    // G2 is not the root — stays unchanged
    expect(adapted).toContain('G2');
  });

  it('melody preserves rest positions exactly', () => {
    const pattern = 'note("C4 ~ ~ E4 ~ G4 ~ ~").sound("triangle")';
    const adapted = adaptMelodyToChord(pattern, ['C', 'E', 'G']);
    const notes = extractNotes(adapted);
    // Rests at indices 1, 2, 4, 6, 7 should be preserved
    expect(notes).toHaveLength(3);
    expect(notes[0].index).toBe(0);
    expect(notes[1].index).toBe(3);
    expect(notes[2].index).toBe(5);
  });

  it('arp preserves rest positions', () => {
    const pattern = 'note("C4 ~ E4 ~ G4 ~").sound("sine")';
    const adapted = adaptArpToChord(pattern, ['C', 'E', 'G'], ['F', 'A', 'C']);
    const notes = extractNotes(adapted);
    expect(notes).toHaveLength(3);
    expect(notes[0].index).toBe(0);
    expect(notes[1].index).toBe(2);
    expect(notes[2].index).toBe(4);
  });
});
