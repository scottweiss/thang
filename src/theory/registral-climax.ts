/**
 * Registral climax — the highest melody note should coincide with
 * the musical climax.
 *
 * In tonal music, a well-crafted melody reserves its highest pitch
 * for the emotional peak. If the highest note appears casually in
 * the intro, the peak loses impact. If it never appears, there's
 * no registral payoff.
 *
 * This module constrains the available register based on section
 * and tension, ensuring the widest range (and highest possible notes)
 * are only available at peak moments:
 *
 * - Intro/breakdown: restricted register (middle octaves)
 * - Build: gradually expanding upward
 * - Peak: full range available — climax notes unlocked
 * - Groove: slightly reduced from peak
 *
 * Works by providing a ceiling that clips melody/arp note generation.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to registral climax.
 * Higher = more dramatic register expansion at peaks.
 */
const REGISTRAL_SENSITIVITY: Record<Mood, number> = {
  trance:    0.60,  // huge registral climaxes
  avril:     0.55,  // dramatic vocal-style peaks
  disco:     0.45,  // dance climaxes
  blockhead: 0.35,  // moderate expansion
  downtempo: 0.30,  // gentle expansion
  lofi:      0.25,  // subtle register movement
  flim:      0.20,  // organic register
  xtal:      0.15,  // dreamy — register is already wide
  syro:      0.10,  // IDM — register is chaotic anyway
  ambient:   0.05,  // barely any registral constraint
};

/**
 * Section base register fraction.
 * 1.0 = full range available, 0.5 = half range.
 */
const SECTION_REGISTER: Record<Section, number> = {
  intro:     0.55,
  build:     0.75,
  peak:      1.00,
  breakdown: 0.60,
  groove:    0.85,
};

/**
 * Calculate the available register ceiling as MIDI note offset
 * above the base octave.
 *
 * @param mood            Current mood
 * @param section         Current section
 * @param sectionProgress Progress through section (0-1)
 * @param tension         Current tension (0-1)
 * @param baseOctave      Base melody octave (typically 4)
 * @returns Maximum MIDI note available (ceiling)
 */
export function registerCeiling(
  mood: Mood,
  section: Section,
  sectionProgress: number,
  tension: number,
  baseOctave: number = 4
): number {
  const sensitivity = REGISTRAL_SENSITIVITY[mood];
  const sectionBase = SECTION_REGISTER[section];

  // Within a build section, register expands as progress increases
  let progressMult = 1.0;
  if (section === 'build') {
    progressMult = 0.7 + sectionProgress * 0.3;
  }

  // Tension opens up the register
  const tensionMult = 0.8 + tension * 0.2;

  // Full register is 3 octaves above base (36 semitones)
  const maxRange = 36;
  const availableRange = maxRange * (
    1.0 - sensitivity * (1.0 - sectionBase * progressMult * tensionMult)
  );

  const baseMidi = baseOctave * 12 + 12; // e.g., C4 = 60
  return Math.round(baseMidi + Math.max(12, availableRange));
}

/**
 * Calculate the available register floor (how low notes can go).
 * Low register opens up in breakdowns and intro for warmth.
 *
 * @param mood            Current mood
 * @param section         Current section
 * @param baseOctave      Base octave
 * @returns Minimum MIDI note available (floor)
 */
export function registerFloor(
  mood: Mood,
  section: Section,
  baseOctave: number = 4
): number {
  const sensitivity = REGISTRAL_SENSITIVITY[mood];

  // How much the floor drops (higher = deeper notes available)
  const sectionFloor: Record<Section, number> = {
    intro:     0.6,
    build:     0.4,
    peak:      0.3,
    breakdown: 0.8,   // breakdowns drop lowest for warmth
    groove:    0.5,
  };

  const baseMidi = baseOctave * 12 + 12;
  const floorOffset = Math.round(12 * sectionFloor[section] * sensitivity);

  return baseMidi - floorOffset;
}

/**
 * Check if a MIDI note is within the available register.
 */
export function isInRegister(
  midiNote: number,
  floor: number,
  ceiling: number
): boolean {
  return midiNote >= floor && midiNote <= ceiling;
}

/**
 * Constrain a note to the available register by octave transposition.
 *
 * @param note     Note string (e.g., "C5")
 * @param floor    Register floor (MIDI)
 * @param ceiling  Register ceiling (MIDI)
 * @returns Adjusted note string
 */
export function constrainToRegister(
  note: string,
  floor: number,
  ceiling: number
): string {
  if (note === '~') return '~';

  const name = note.replace(/\d+$/, '');
  const octStr = note.match(/\d+$/)?.[0];
  if (!octStr) return note;

  const octave = parseInt(octStr);
  const NOTE_TO_PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };

  const pc = NOTE_TO_PC[name] ?? 0;
  let midi = (octave + 1) * 12 + pc;

  // Transpose up or down by octave to fit
  while (midi > ceiling && midi > 12) midi -= 12;
  while (midi < floor && midi < 127) midi += 12;

  // Convert back
  const newOct = Math.floor(midi / 12) - 1;
  return `${name}${newOct}`;
}

/**
 * Get registral sensitivity for a mood (for testing).
 */
export function registralSensitivity(mood: Mood): number {
  return REGISTRAL_SENSITIVITY[mood];
}
