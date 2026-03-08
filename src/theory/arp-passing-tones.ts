/**
 * Arp passing tones — weave scale tones between chord tones.
 *
 * Plain chord-tone arpeggios sound mechanical. Real musicians add
 * passing tones (scale notes between chord tones) to create flowing
 * lines. This module enriches arp note pools by inserting diatonic
 * passing tones between adjacent chord tones.
 *
 * Example:
 *   Chord tones: C4 E4 G4 B4
 *   With passing: C4 D4 E4 F4 G4 A4 B4  (scale fills the gaps)
 *
 * The ratio of chord tones to passing tones is mood-dependent:
 * - Lofi/jazz: more passing tones (scalar runs between chords)
 * - Trance: fewer (pure chord tones for clarity)
 * - Syro: chromatic passing tones for angular lines
 */

import type { Mood, Section } from '../types';

/**
 * Enrich an arp note pool with scale-tone passing tones.
 *
 * @param chordNotes  Chord tones sorted low to high (e.g., ["C4", "E4", "G4"])
 * @param scaleNotes  Available scale note names without octave (e.g., ["C", "D", "E", "F", "G", "A", "B"])
 * @param mood        Current mood
 * @returns Enriched note pool with passing tones inserted
 */
export function addPassingTones(
  chordNotes: string[],
  scaleNotes: string[],
  mood: Mood
): string[] {
  if (chordNotes.length < 2 || scaleNotes.length === 0) return chordNotes;

  const density = PASSING_TONE_DENSITY[mood];
  if (density <= 0) return chordNotes;

  const result: string[] = [];

  for (let i = 0; i < chordNotes.length; i++) {
    result.push(chordNotes[i]);

    // Insert passing tones between this note and the next
    if (i < chordNotes.length - 1) {
      const passing = findPassingTones(chordNotes[i], chordNotes[i + 1], scaleNotes);
      // Include a fraction of available passing tones based on density
      const count = Math.round(passing.length * density);
      for (let j = 0; j < count; j++) {
        result.push(passing[j]);
      }
    }
  }

  return result;
}

/**
 * Find scale tones between two chord tones.
 */
function findPassingTones(
  lower: string,
  upper: string,
  scaleNotes: string[]
): string[] {
  const lowerPitch = approxPitch(lower);
  const upperPitch = approxPitch(upper);
  if (lowerPitch >= upperPitch) return [];

  const lowerName = lower.replace(/\d+$/, '');
  const lowerOct = parseInt(lower.match(/\d+$/)?.[0] ?? '4');
  const upperName = upper.replace(/\d+$/, '');
  const upperOct = parseInt(upper.match(/\d+$/)?.[0] ?? '4');

  const passing: string[] = [];

  // Generate all scale notes in the range between lower and upper
  for (let oct = lowerOct; oct <= upperOct; oct++) {
    for (const note of scaleNotes) {
      const candidate = `${note}${oct}`;
      const pitch = approxPitch(candidate);
      // Only include notes strictly between the chord tones
      if (pitch > lowerPitch && pitch < upperPitch) {
        // Skip if it's the same note name as either endpoint
        if (note !== lowerName || oct !== lowerOct) {
          if (note !== upperName || oct !== upperOct) {
            passing.push(candidate);
          }
        }
      }
    }
  }

  // Sort by pitch
  passing.sort((a, b) => approxPitch(a) - approxPitch(b));
  return passing;
}

/**
 * Whether passing tones should be added for this mood/section.
 */
export function shouldAddPassingTones(mood: Mood, section: Section): boolean {
  const density = PASSING_TONE_DENSITY[mood];
  const sectionMult = SECTION_PASSING_MULT[section];
  return density * sectionMult >= 0.1;
}

/**
 * How many passing tones to include (0-1 fraction of available).
 */
export function passingToneDensity(mood: Mood, section: Section): number {
  return PASSING_TONE_DENSITY[mood] * SECTION_PASSING_MULT[section];
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return 0;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** How many passing tones to include per mood (0 = none, 1 = all available) */
const PASSING_TONE_DENSITY: Record<Mood, number> = {
  lofi:      0.60,   // jazzy scalar runs
  downtempo: 0.50,   // smooth passing motion
  blockhead: 0.45,   // neo-soul melodic arps
  avril:     0.40,   // piano-like scalar fills
  flim:      0.35,   // delicate connecting tones
  xtal:      0.30,   // dreamy scale fragments
  disco:     0.25,   // some scalar motion
  syro:      0.20,   // sparse angular passing
  ambient:   0.15,   // very occasional
  trance:    0.10,   // mostly pure chord tones
};

/** Section multiplier for passing tone density */
const SECTION_PASSING_MULT: Record<Section, number> = {
  groove:    1.2,    // settled — flowing lines
  peak:      1.0,    // full energy
  build:     0.8,    // building momentum
  breakdown: 0.6,    // sparse — fewer passing tones
  intro:     0.5,    // establishing — simple arps
};
