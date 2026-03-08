/**
 * Melodic ornamentation — decorative notes that add detail.
 *
 * In real performance, melodies are rarely played exactly as written.
 * Performers add approach patterns that vary by genre:
 *
 * - **Lower neighbor**: approach from scale step below (classical)
 * - **Upper neighbor**: approach from scale step above (folk)
 * - **Enclosure**: step above then step below (or vice versa) → target (jazz)
 * - **Double approach**: two steps below ascending into target (bebop)
 * - **Chromatic approach**: half-step below → target (jazz/blues color)
 *
 * Different moods prefer different approach types, creating genre-appropriate
 * embellishment without explicit genre coding.
 */

import type { Mood } from '../types';

type ApproachType = 'lower' | 'upper' | 'enclosure' | 'double' | 'chromatic';

/**
 * How much ornamentation each mood wants.
 * 0 = none, 1 = heavy embellishment.
 */
const MOOD_ORNAMENT_AMOUNT: Record<Mood, number> = {
  ambient: 0.0,     // clean, spacious
  downtempo: 0.15,  // subtle
  lofi: 0.2,        // jazzy embellishment
  trance: 0.05,     // mostly clean
  avril: 0.1,       // gentle touches
  xtal: 0.05,       // sparse, deliberate
  syro: 0.3,        // detailed ornamentation
  blockhead: 0.25,  // jazzy, ornate
  flim: 0.1,        // delicate
  disco: 0.15,      // funky grace notes
};

/**
 * Preferred approach patterns per mood.
 * Weights determine selection probability (higher = more likely).
 */
const MOOD_APPROACH_WEIGHTS: Record<Mood, Partial<Record<ApproachType, number>>> = {
  ambient:   { lower: 1 },                                        // won't fire (amount=0)
  downtempo: { lower: 3, upper: 2, chromatic: 1 },                // mostly diatonic
  lofi:      { lower: 2, upper: 1, enclosure: 2, chromatic: 2 },  // jazzy
  trance:    { lower: 2, upper: 2 },                               // clean, symmetric
  avril:     { lower: 3, upper: 1 },                               // gentle, from below
  xtal:      { lower: 2, upper: 2 },                               // symmetric
  syro:      { lower: 1, upper: 1, enclosure: 3, double: 2, chromatic: 2 }, // ornate
  blockhead: { lower: 2, enclosure: 3, double: 2, chromatic: 2 }, // jazzy/hip-hop
  flim:      { lower: 3, upper: 2 },                               // delicate
  disco:     { lower: 2, upper: 1, chromatic: 1 },                // funky
};

/**
 * Select an approach type based on mood weights.
 */
function selectApproachType(mood: Mood): ApproachType {
  const weights = MOOD_APPROACH_WEIGHTS[mood] ?? { lower: 1 };
  const entries = Object.entries(weights) as [ApproachType, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0) return 'lower';

  let roll = Math.random() * total;
  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return entries[entries.length - 1][0];
}

/**
 * Apply a specific approach pattern, returning the ornament notes
 * to place in the rest positions before the target.
 *
 * @param targetIdx  Index of target note in ladder
 * @param ladder     Available pitches
 * @param type       Approach pattern type
 * @param slotsAvailable  Number of rest slots before the target
 * @returns Array of ladder notes (1 or 2 elements depending on pattern)
 */
function applyApproach(
  targetIdx: number,
  ladder: string[],
  type: ApproachType,
  slotsAvailable: number
): string[] {
  const maxIdx = ladder.length - 1;

  switch (type) {
    case 'lower': {
      const idx = Math.max(0, targetIdx - 1);
      return idx !== targetIdx ? [ladder[idx]] : [];
    }
    case 'upper': {
      const idx = Math.min(maxIdx, targetIdx + 1);
      return idx !== targetIdx ? [ladder[idx]] : [];
    }
    case 'enclosure': {
      // Step above then step below (needs 2 slots)
      if (slotsAvailable < 2) {
        // Fall back to single approach
        return targetIdx > 0 ? [ladder[targetIdx - 1]] : [];
      }
      const above = Math.min(maxIdx, targetIdx + 1);
      const below = Math.max(0, targetIdx - 1);
      if (above === targetIdx || below === targetIdx) return [];
      return [ladder[above], ladder[below]];
    }
    case 'double': {
      // Two steps below ascending (needs 2 slots)
      if (slotsAvailable < 2) {
        return targetIdx > 0 ? [ladder[Math.max(0, targetIdx - 1)]] : [];
      }
      const step1 = Math.max(0, targetIdx - 2);
      const step2 = Math.max(0, targetIdx - 1);
      if (step1 === targetIdx) return [];
      return [ladder[step1], ladder[step2]];
    }
    case 'chromatic': {
      // For chromatic, we go half-step below regardless of scale
      // Parse the target note and lower it by one semitone
      const target = ladder[targetIdx];
      const match = target.match(/^([A-G][b#]?)(\d)$/);
      if (!match) return [];
      const chromaticNote = chromaticLower(match[1], parseInt(match[2]));
      return chromaticNote ? [chromaticNote] : [];
    }
  }
}

/**
 * Lower a note by one semitone (chromatic half-step).
 */
function chromaticLower(noteName: string, octave: number): string | null {
  const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Normalize flats to sharps for lookup
  const normalize: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  };
  const norm = normalize[noteName] ?? noteName;
  const idx = chromaticScale.indexOf(norm);
  if (idx < 0) return null;

  if (idx === 0) {
    // C → B of octave below
    return `B${octave - 1}`;
  }
  return `${chromaticScale[idx - 1]}${octave}`;
}

/**
 * Add ornamental notes to a melody pattern.
 * Ornaments replace rests before active notes with approach tones.
 * Approach patterns vary by mood for genre-appropriate embellishment.
 *
 * @param elements   Note pattern array ('~' = rest, else = note string)
 * @param ladder     Available pitch ladder (sorted low to high)
 * @param mood       Current mood
 * @param tension    Current tension (0-1) — higher = more ornaments
 * @returns Modified pattern with ornaments added
 */
export function addOrnaments(
  elements: string[],
  ladder: string[],
  mood: Mood,
  tension: number
): string[] {
  const amount = MOOD_ORNAMENT_AMOUNT[mood] ?? 0.1;
  if (amount === 0) return elements;

  // Scale probability with both mood amount and tension
  const probability = amount * (0.5 + tension * 0.5);
  const result = [...elements];

  for (let i = 1; i < result.length; i++) {
    if (result[i] === '~') continue;         // skip rests
    if (result[i - 1] !== '~') continue;     // need a rest before the note
    if (Math.random() >= probability) continue;

    // Find this note in the ladder
    const noteIdx = ladder.indexOf(result[i]);
    if (noteIdx < 0) continue;

    // Count available rest slots before this note
    let slotsAvailable = 0;
    for (let j = i - 1; j >= 0 && result[j] === '~'; j--) {
      slotsAvailable++;
    }

    // Select approach pattern based on mood
    const approachType = selectApproachType(mood);
    const ornaments = applyApproach(noteIdx, ladder, approachType, slotsAvailable);

    // Place ornament notes in the rest slots before the target
    if (ornaments.length === 1) {
      result[i - 1] = ornaments[0];
    } else if (ornaments.length === 2 && slotsAvailable >= 2) {
      result[i - 2] = ornaments[0];
      result[i - 1] = ornaments[1];
    }
  }

  return result;
}

/**
 * Get the ornamentation amount for a mood.
 */
export function getOrnamentAmount(mood: Mood): number {
  return MOOD_ORNAMENT_AMOUNT[mood] ?? 0.1;
}
