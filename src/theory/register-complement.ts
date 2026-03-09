/**
 * Register complementarity — melody and arp occupy opposite pitch
 * registers for clear counterpoint separation.
 *
 * When two melodic voices occupy the same register, they mask each
 * other. Classical counterpoint avoids this by keeping voices in
 * complementary ranges: soprano high, alto mid, tenor low-mid, bass low.
 *
 * This module tracks the melody's current register and suggests an
 * octave offset for the arp that creates maximum pitch-space separation.
 * The effect is subtle (±1 octave) but creates clarity.
 *
 * Rules:
 * - If melody is in high register (C5+): arp shifts down
 * - If melody is in low register (C3-): arp shifts up
 * - If melody is mid: arp stays neutral or slight offset
 * - Harmony always stays in its natural register (anchor)
 * - Strength varies by mood (jazz=strong, trance=weak)
 */

import type { Mood } from '../types';

/** How strongly to enforce register complementarity (0-1) */
const COMPLEMENT_STRENGTH: Record<Mood, number> = {
  lofi:      0.75,   // jazz voice separation — clear counterpoint
  downtempo: 0.55,   // smooth separation
  avril:     0.50,   // intimate clarity
  flim:      0.45,   // delicate counterpoint
  blockhead: 0.55,   // hip-hop — arp must separate from melody
  disco:     0.50,   // funky separation
  syro:      0.35,   // IDM — some crossing OK
  xtal:      0.30,   // dreamy overlap OK
  trance:    0.25,   // power — less separation needed
  ambient:   0.10,   // floating — overlap fine
};

/** Reference MIDI values for register boundaries */
const LOW_BOUNDARY = 48;   // C3
const MID_POINT = 60;      // C4
const HIGH_BOUNDARY = 72;  // C5

/**
 * Compute an octave offset for the arp based on the melody's register.
 * Positive = shift arp up, negative = shift arp down.
 *
 * @param melodyNotes   Recent melody notes (with octave)
 * @param mood          Current mood
 * @returns Octave offset for arp (-1, 0, or +1)
 */
export function arpRegisterOffset(
  melodyNotes: string[],
  mood: Mood
): number {
  if (melodyNotes.length === 0) return 0;

  const strength = COMPLEMENT_STRENGTH[mood];
  if (strength < 0.15) return 0;

  // Compute average melody register
  const midis = melodyNotes
    .map(noteToMidi)
    .filter(m => m >= 0);

  if (midis.length === 0) return 0;

  const avgMidi = midis.reduce((sum, m) => sum + m, 0) / midis.length;

  // Melody is high → arp goes low
  if (avgMidi >= HIGH_BOUNDARY) {
    return Math.random() < strength ? -1 : 0;
  }

  // Melody is low → arp goes high
  if (avgMidi <= LOW_BOUNDARY) {
    return Math.random() < strength ? 1 : 0;
  }

  // Melody is mid — slight offset based on tendency
  if (avgMidi > MID_POINT + 4) {
    return Math.random() < strength * 0.5 ? -1 : 0;
  }
  if (avgMidi < MID_POINT - 4) {
    return Math.random() < strength * 0.5 ? 1 : 0;
  }

  return 0;
}

/**
 * Compute a register offset for any layer relative to the melody.
 * More general version that works for harmony, texture, etc.
 *
 * @param melodyNotes   Recent melody notes
 * @param layerName     Layer to compute offset for
 * @param mood          Current mood
 * @returns Octave offset (-1, 0, or +1)
 */
export function layerRegisterOffset(
  melodyNotes: string[],
  layerName: string,
  mood: Mood
): number {
  // Only arp benefits from register complementarity
  // Harmony has its own voicing logic, drone is always low
  if (layerName !== 'arp') return 0;
  return arpRegisterOffset(melodyNotes, mood);
}

/**
 * Whether register complementarity should be applied.
 */
export function shouldApplyRegisterComplement(mood: Mood): boolean {
  return COMPLEMENT_STRENGTH[mood] >= 0.15;
}

/**
 * Get complement strength for a mood (for testing).
 */
export function registerComplementStrength(mood: Mood): number {
  return COMPLEMENT_STRENGTH[mood];
}

/** Convert note to MIDI for register analysis */
function noteToMidi(note: string): number {
  const match = note.match(/^([A-G])(b|#)?(\d+)$/);
  if (!match) return -1;
  const [, name, accidental, octStr] = match;
  const baseMap: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let midi = baseMap[name] ?? 0;
  if (accidental === '#') midi++;
  if (accidental === 'b') midi--;
  return midi + (parseInt(octStr) + 1) * 12;
}
