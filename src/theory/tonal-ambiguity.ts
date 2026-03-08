/**
 * Tonal ambiguity — deliberate key center blurring for dreamlike quality.
 *
 * In tonal music, the key center provides a "home" feeling. But some of
 * the most evocative moments occur when that home becomes unclear:
 *
 * - Debussy's whole-tone passages dissolve tonal gravity
 * - Modal jazz sits between keys (Herbie Hancock's "Maiden Voyage")
 * - Ambient music thrives on harmonic suspension
 *
 * This module provides tools for creating controlled tonal ambiguity:
 * - Symmetric intervals that don't point to any key (tritones, whole-tone)
 * - Pivot tones shared between distant keys
 * - Common-tone modulation targets
 *
 * Ambiguity is mood-dependent: ambient/xtal want it most, trance wants
 * it least (trance thrives on clear harmonic direction).
 */

import type { Mood, Section, NoteName } from '../types';

/** How much each mood favors tonal ambiguity (0-1) */
const AMBIGUITY_APPETITE: Record<Mood, number> = {
  ambient:   0.60,   // dreamlike, floating
  xtal:      0.55,   // hazy, nostalgic
  avril:     0.30,   // songwriter — mostly clear, occasional haze
  downtempo: 0.35,   // laid-back, some drift
  flim:      0.40,   // organic IDM, dream-pop edges
  lofi:      0.25,   // jazz likes ambiguity but within functional harmony
  syro:      0.20,   // IDM — harmonically adventurous but structured
  blockhead: 0.15,   // hip-hop — anchored grooves
  disco:     0.10,   // functional harmony drives the groove
  trance:    0.05,   // needs clear harmonic direction
};

/** Section modifies ambiguity */
const SECTION_AMBIGUITY_MULT: Record<Section, number> = {
  intro:     1.3,    // mystery at the start
  build:     0.7,    // building needs direction
  peak:      0.5,    // peak is maximally clear
  breakdown: 1.5,    // most ambiguous — dissolution
  groove:    0.8,    // groove needs some anchor
};

/** Chromatic note indices for interval calculations */
const NOTE_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Score how ambiguous a set of notes is tonally (0-1).
 * Higher = harder to assign a clear key center.
 *
 * Factors:
 * - Tritones increase ambiguity (symmetric interval)
 * - Whole-tone steps without semitones increase ambiguity
 * - Chromatic clusters increase ambiguity
 *
 * @param notes Array of note names (pitch classes without octave)
 */
export function tonalAmbiguityScore(notes: string[]): number {
  if (notes.length < 2) return 0;

  const pitchClasses = notes
    .map(n => n.replace(/[0-9]/g, ''))
    .map(n => NOTE_INDICES[n])
    .filter(n => n !== undefined);

  if (pitchClasses.length < 2) return 0;

  const unique = [...new Set(pitchClasses)];
  let ambiguity = 0;

  // Count tritones (interval of 6 semitones — maximally symmetric)
  let tritoneCount = 0;
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const interval = Math.abs(unique[i] - unique[j]);
      const normalized = Math.min(interval, 12 - interval);
      if (normalized === 6) tritoneCount++;
    }
  }
  ambiguity += tritoneCount * 0.3;

  // Check for whole-tone collection tendency
  // If all intervals are even (0, 2, 4, 6, 8, 10), it's whole-tone
  const allEven = unique.every(p => p % 2 === 0) || unique.every(p => p % 2 === 1);
  if (allEven && unique.length >= 3) ambiguity += 0.25;

  // Chromatic clusters (adjacent semitones)
  unique.sort((a, b) => a - b);
  let chromaticPairs = 0;
  for (let i = 0; i < unique.length - 1; i++) {
    if (unique[i + 1] - unique[i] === 1 || (unique[i] === 11 && unique[0] === 0)) {
      chromaticPairs++;
    }
  }
  if (chromaticPairs >= 2) ambiguity += 0.2;

  return Math.min(1.0, ambiguity);
}

/**
 * Suggest notes that would increase tonal ambiguity when added to a chord.
 * Returns pitch classes (without octave) that create maximum blur.
 *
 * @param currentNotes  Current chord/voicing notes
 * @param scaleNotes    Available scale notes
 * @returns Up to 2 notes that maximize ambiguity
 */
export function suggestAmbiguousExtensions(
  currentNotes: string[],
  scaleNotes: NoteName[]
): string[] {
  const currentPCs = currentNotes.map(n => n.replace(/[0-9]/g, ''));
  const candidates = scaleNotes.filter(n => !currentPCs.includes(n));

  // Score each candidate by how much it increases ambiguity
  const scored = candidates.map(c => ({
    note: c,
    score: tonalAmbiguityScore([...currentPCs, c]) - tonalAmbiguityScore(currentPCs),
  }));

  // Return top 2 by ambiguity increase
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).filter(s => s.score > 0).map(s => s.note);
}

/**
 * Whether tonal ambiguity should be applied at this moment.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @param tension  Current tension (0-1)
 */
export function shouldApplyAmbiguity(
  mood: Mood,
  section: Section,
  tension: number
): boolean {
  const appetite = AMBIGUITY_APPETITE[mood] * (SECTION_AMBIGUITY_MULT[section] ?? 1.0);
  // Low tension favors ambiguity (relaxed, dreamy)
  // High tension favors clarity (needs direction to resolve)
  const tensionFactor = 1.0 - tension * 0.5;
  return appetite * tensionFactor > 0.2;
}

/**
 * Get the ambiguity appetite for a mood (for testing/inspection).
 */
export function ambiguityAppetite(mood: Mood): number {
  return AMBIGUITY_APPETITE[mood];
}

/**
 * How much to darken (lower LPF) when ambiguity is active.
 * Darker timbres feel more ambiguous; bright timbres feel more defined.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @returns LPF multiplier (0.8-1.0, lower = darker)
 */
export function ambiguityDarkenFactor(
  mood: Mood,
  section: Section
): number {
  const appetite = AMBIGUITY_APPETITE[mood] * (SECTION_AMBIGUITY_MULT[section] ?? 1.0);
  // More ambiguity = darker timbre
  return 1.0 - appetite * 0.15;
}
