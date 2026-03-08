/**
 * Color pedal — a sustained common tone while harmony shifts underneath.
 *
 * Unlike a bass pedal (which holds the lowest note), a color pedal
 * holds a note in the middle or upper register as chords change
 * around it. This creates beautiful dissonance-consonance shifts
 * as the held note alternately clashes with and resolves into
 * the changing harmony.
 *
 * Famous examples:
 * - Debussy's "Clair de Lune" — sustained Db above shifting harmony
 * - Ravel's "Jeux d'eau" — shimmering high pedal tones
 * - Brian Eno's ambient works — sustained tones with slow chord movement
 * - Film scores — held string note while orchestra moves underneath
 *
 * The most effective pedal tones are:
 * - Scale degree 5 (dominant): always consonant, anchoring
 * - Scale degree 1 (tonic): grounding, stable
 * - Scale degree 3 (mediant): creates major/minor ambiguity
 * - Scale degree 2 (supertonic): creates suspension effect
 *
 * Application: during breakdowns and ambient passages, the arp or
 * harmony layer sustains a single note while other voices move.
 * This creates the "shimmering" quality of impressionist music.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses color pedals (0-1) */
const PEDAL_TENDENCY: Record<Mood, number> = {
  ambient:   0.45,  // sustained textures — natural home
  xtal:      0.38,  // shimmering sustain
  flim:      0.28,  // organic sustain
  avril:     0.22,  // songwriter — held notes
  downtempo: 0.18,  // gentle sustain
  lofi:      0.12,  // jazz — less sustain
  syro:      0.08,  // IDM — too busy usually
  blockhead: 0.05,  // hip-hop — percussive
  disco:     0.04,  // rhythmic, not sustained
  trance:    0.03,  // driving, not sustained
};

/** Section multipliers */
const SECTION_PEDAL_MULT: Record<Section, number> = {
  intro:     1.5,   // perfect for establishing color
  build:     0.5,   // too busy
  peak:      0.3,   // too dense
  breakdown: 2.0,   // ideal — sparse + pedal = beautiful
  groove:    0.8,   // moderate
};

/**
 * Whether to apply a color pedal at this moment.
 */
export function shouldApplyColorPedal(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = PEDAL_TENDENCY[mood] * (SECTION_PEDAL_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 47087) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Select the best pedal tone from the current scale.
 * Prefers the 5th degree, then root, then 3rd.
 *
 * @param scaleNotes  Available scale notes (without octave)
 * @param root        Scale root
 * @param octave      Octave for the pedal (typically 4-5)
 * @param tick        For determinism
 * @returns Pedal note with octave
 */
export function selectPedalTone(
  scaleNotes: string[],
  root: string,
  octave: number,
  tick: number
): string {
  if (scaleNotes.length === 0) return `${root}${octave}`;

  // Scale degree preferences for pedal tones
  const rootIdx = scaleNotes.indexOf(root);
  if (rootIdx < 0) return `${scaleNotes[0]}${octave}`;

  // Candidate degrees: 5th (4 steps up in 7-note scale), root (0), 3rd (2)
  const candidates: number[] = [];
  const fifthIdx = (rootIdx + 4) % scaleNotes.length; // approximate 5th
  const thirdIdx = (rootIdx + 2) % scaleNotes.length; // approximate 3rd
  const secondIdx = (rootIdx + 1) % scaleNotes.length; // supertonic

  candidates.push(fifthIdx, rootIdx, thirdIdx, secondIdx);

  const hash = ((tick * 65537 + 51001) >>> 0) % candidates.length;
  const chosenIdx = candidates[hash];
  return `${scaleNotes[chosenIdx]}${octave}`;
}

/**
 * Create a pedal tone pattern: the held note repeats across all steps,
 * creating a sustained effect when played by a pad-like voice.
 *
 * @param pedalNote  The note to sustain
 * @param length     Pattern length
 * @param density    How many steps get the pedal (0-1)
 * @returns Pattern array with the pedal note and rests
 */
export function pedalPattern(
  pedalNote: string,
  length: number,
  density: number = 0.5
): string[] {
  const result: string[] = new Array(length).fill('~');

  // Place pedal note at regular intervals based on density
  const interval = Math.max(1, Math.round(1 / Math.max(0.1, density)));
  for (let i = 0; i < length; i += interval) {
    result[i] = pedalNote;
  }

  return result;
}

/**
 * Select the octave for the pedal based on mood.
 * Ambient/xtal use higher octaves (shimmering), lofi uses middle.
 */
export function pedalOctave(mood: Mood): number {
  const octaves: Record<Mood, number> = {
    ambient:   5,    // high shimmering
    xtal:      5,    // high ethereal
    flim:      4,    // middle
    avril:     4,    // singer range
    downtempo: 4,    // middle
    lofi:      4,    // mid-register
    syro:      5,    // high, piercing
    blockhead: 3,    // low
    disco:     4,    // middle
    trance:    5,    // high
  };
  return octaves[mood];
}

/**
 * Get color pedal tendency for a mood (for testing).
 */
export function colorPedalTendency(mood: Mood): number {
  return PEDAL_TENDENCY[mood];
}
