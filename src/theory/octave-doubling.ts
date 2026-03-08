/**
 * Octave doubling — reinforce melodic notes at high energy.
 *
 * When a melody needs to CUT through a dense arrangement (peak/groove),
 * doubling key notes at the octave creates power and presence without
 * adding new pitch content. This is how orchestral arrangements and
 * synth leads get their size.
 *
 * Applied selectively: only on strong beats, only at high tension,
 * and with probability gated by mood.
 */

import type { Mood, Section } from '../types';

/**
 * Add octave doublings to a melody step array.
 * Notes on strong beats get an octave-above version appended in brackets.
 *
 * Since Strudel supports chord notation with comma-separated notes,
 * we return notes that include the octave double as a chord: "C4,C5"
 *
 * @param elements   Step array
 * @param tension    Current tension 0-1
 * @param section    Current section
 * @param mood       Current mood
 * @param restToken  Rest marker
 * @returns Modified step array with doublings
 */
export function addOctaveDoublings(
  elements: string[],
  tension: number,
  section: Section,
  mood: Mood,
  restToken: string = '~'
): string[] {
  if (!shouldDouble(tension, section, mood)) return elements;

  const prob = doublingProbability(tension, section, mood);
  const result = [...elements];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === restToken) continue;

    // Only double on strong beats (0, 4, 8, 12 in 16-step grid)
    const isStrong = i % 4 === 0;
    if (!isStrong) continue;

    if (Math.random() < prob) {
      const doubled = octaveUp(result[i]);
      if (doubled) {
        // Strudel chord notation: [note1, note2]
        result[i] = `[${result[i]},${doubled}]`;
      }
    }
  }

  return result;
}

/**
 * Whether octave doubling should be considered.
 */
function shouldDouble(tension: number, section: Section, mood: Mood): boolean {
  if (tension < 0.5) return false;
  if (section === 'intro' || section === 'breakdown') return false;
  return MOOD_DOUBLING_SENSITIVITY[mood] > 0.1;
}

/**
 * Probability of doubling a strong-beat note.
 */
function doublingProbability(tension: number, section: Section, mood: Mood): number {
  const base = MOOD_DOUBLING_SENSITIVITY[mood];
  const sectionMult = section === 'peak' ? 1.5 : section === 'groove' ? 1.0 : 0.5;
  const tensionMult = (tension - 0.5) * 2; // 0-1 range for tension above 0.5
  return Math.min(0.4, base * sectionMult * tensionMult);
}

/**
 * Shift a note up one octave.
 * Returns null if the result would be too high (>= octave 7).
 */
function octaveUp(note: string): string | null {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return null;
  const octave = parseInt(match[2]);
  if (octave >= 6) return null; // too high
  return `${match[1]}${octave + 1}`;
}

const MOOD_DOUBLING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.4,   // anthemic — doublings add power
  disco:     0.3,   // energy boosts
  blockhead: 0.25,  // occasional emphasis
  syro:      0.2,   // some IDM intensity
  lofi:      0.1,   // rare
  downtempo: 0.1,   // rare
  xtal:      0.05,  // very rare
  ambient:   0.0,   // never
  avril:     0.0,   // never — intimate
  flim:      0.05,  // very rare
};
