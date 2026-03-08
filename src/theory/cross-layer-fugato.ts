/**
 * Cross-layer fugato — multi-layer motivic imitation.
 *
 * Tracks a core melodic subject and staggers its entry across layers
 * at section boundaries, creating fugal exposition effects.
 * Each layer gets the subject at a register-appropriate transposition.
 *
 * Unlike motif-memory (single-layer recall) or imitative-echo (arp
 * shadows melody), this orchestrates formal subject/answer entries
 * across all polyphonic layers for structural unity.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood fugato intensity (higher = more layers participate).
 */
const FUGATO_INTENSITY: Record<Mood, number> = {
  trance:    0.35,  // moderate — structured builds
  avril:     0.55,  // strong — classical counterpoint
  disco:     0.25,  // light
  downtempo: 0.30,  // moderate
  blockhead: 0.40,  // moderate-strong
  lofi:      0.35,  // moderate jazz
  flim:      0.45,  // organic density
  xtal:      0.50,  // ambient layering
  syro:      0.40,  // IDM complexity
  ambient:   0.10,  // minimal
};

/**
 * Section multiplier for fugato activation.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.3,
  build:     1.0,   // fugato strongest during builds
  peak:      0.7,
  breakdown: 0.2,
  groove:    0.5,
};

/**
 * Layer entry order and register offset (in octaves).
 */
const LAYER_ENTRY: Record<string, { order: number; octaveOffset: number }> = {
  melody:  { order: 0, octaveOffset: 0 },
  arp:     { order: 1, octaveOffset: 0 },
  harmony: { order: 2, octaveOffset: -1 },
};

/**
 * Should fugato be applied at this tick?
 * Triggers at section boundaries during builds/peaks.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @param sectionChanged Whether section just changed
 */
export function shouldApplyFugato(
  tick: number,
  mood: Mood,
  section: Section,
  sectionChanged: boolean
): boolean {
  if (!sectionChanged) return false;
  const effective = FUGATO_INTENSITY[mood] * SECTION_MULT[section];
  return effective > 0.15;
}

/**
 * Get the fugato entry delay for a layer (in ticks).
 * Subject enters first (0), answer enters after 1 tick, countersubject after 2.
 *
 * @param layerName Layer name
 * @param mood Current mood
 * @returns Entry delay in ticks (0-2), or -1 if layer shouldn't participate
 */
export function fugatoEntryDelay(layerName: string, mood: Mood): number {
  const entry = LAYER_ENTRY[layerName];
  if (!entry) return -1;
  const intensity = FUGATO_INTENSITY[mood];
  // Fewer layers participate at low intensity
  if (entry.order > 0 && intensity < 0.25) return -1;
  if (entry.order > 1 && intensity < 0.40) return -1;
  return entry.order;
}

/**
 * Get the octave transposition for a layer's fugato entry.
 *
 * @param layerName Layer name
 * @returns Octave offset (e.g., -1 for harmony = one octave down)
 */
export function fugatoOctaveOffset(layerName: string): number {
  return LAYER_ENTRY[layerName]?.octaveOffset ?? 0;
}

/**
 * Transpose a motif by semitones.
 * Handles note names like "C4", "D#5", "~" (rest).
 *
 * @param motif Array of note strings
 * @param semitones Transposition amount
 * @returns Transposed motif
 */
export function transposeMotif(motif: string[], semitones: number): string[] {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const NOTE_MAP: Record<string, number> = {};
  for (let i = 0; i < NOTE_NAMES.length; i++) NOTE_MAP[NOTE_NAMES[i]] = i;
  NOTE_MAP['Db'] = 1; NOTE_MAP['Eb'] = 3; NOTE_MAP['Gb'] = 6;
  NOTE_MAP['Ab'] = 8; NOTE_MAP['Bb'] = 10;

  return motif.map(note => {
    if (note === '~') return '~';
    const name = note.replace(/\d+$/, '');
    const octStr = note.match(/\d+$/)?.[0];
    const oct = octStr ? parseInt(octStr) : 4;
    const pc = NOTE_MAP[name];
    if (pc === undefined) return note;
    const newMidi = pc + oct * 12 + semitones;
    const newPc = ((newMidi % 12) + 12) % 12;
    const newOct = Math.floor(newMidi / 12);
    return `${NOTE_NAMES[newPc]}${newOct}`;
  });
}

/**
 * Get fugato intensity for a mood (for testing).
 */
export function fugatoIntensity(mood: Mood): number {
  return FUGATO_INTENSITY[mood];
}
