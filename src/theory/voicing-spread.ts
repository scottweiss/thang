/**
 * Voicing spread — dynamic chord voicing width.
 *
 * In orchestration, the spread of chord voicings dramatically affects
 * the emotional impact:
 * - Close voicings (notes within one octave): intimate, warm, dark
 * - Open voicings (notes spread across 2+ octaves): powerful, bright, spacious
 * - Drop voicings (one note dropped an octave): jazz clarity, air between voices
 *
 * This module controls how wide harmony voicings should be based on
 * section and tension, creating natural dynamic builds.
 */

import type { Section } from '../types';

export interface VoicingRange {
  lowOctave: number;   // lowest octave for voicing
  highOctave: number;  // highest octave for voicing
  spread: number;      // 0 = close, 1 = wide open
}

/**
 * Get the target voicing range for the current section and tension.
 *
 * @param section   Current section
 * @param tension   Overall tension (0-1)
 * @returns Voicing range parameters
 */
export function getVoicingRange(
  section: Section,
  tension: number
): VoicingRange {
  // Base ranges per section
  const sectionRanges: Record<Section, VoicingRange> = {
    intro:     { lowOctave: 3, highOctave: 4, spread: 0.3 },
    build:     { lowOctave: 3, highOctave: 4, spread: 0.5 },
    peak:      { lowOctave: 2, highOctave: 5, spread: 0.9 },
    breakdown: { lowOctave: 3, highOctave: 4, spread: 0.2 },
    groove:    { lowOctave: 3, highOctave: 5, spread: 0.6 },
  };

  const base = sectionRanges[section];

  // Tension widens the range slightly
  const tensionBoost = tension * 0.15;

  return {
    lowOctave: base.lowOctave,
    highOctave: base.highOctave,
    spread: Math.min(1.0, base.spread + tensionBoost),
  };
}

/**
 * Apply voicing spread to chord notes.
 * Redistributes notes across the target octave range based on spread amount.
 *
 * @param notes    Chord notes with octave (e.g., ['C3', 'E3', 'G3', 'B3'])
 * @param range    Target voicing range
 * @returns Redistributed notes
 */
export function applyVoicingSpread(
  notes: string[],
  range: VoicingRange
): string[] {
  if (notes.length <= 1) return notes;

  // Parse note names and octaves
  const parsed = notes.map(n => {
    const match = n.match(/^([A-G]#?)(\d)$/);
    if (!match) return { name: n, oct: 3 };
    return { name: match[1], oct: parseInt(match[2]) };
  });

  // At low spread, keep notes close together (within 1 octave)
  // At high spread, distribute across the full range
  const targetRange = range.highOctave - range.lowOctave;
  const effectiveRange = Math.max(1, Math.round(targetRange * range.spread));

  // Distribute voices evenly across the effective range
  const result = parsed.map((note, i) => {
    const progress = notes.length > 1 ? i / (notes.length - 1) : 0.5;
    const targetOct = Math.round(range.lowOctave + progress * effectiveRange);
    const clampedOct = Math.max(range.lowOctave, Math.min(range.highOctave, targetOct));
    return `${note.name}${clampedOct}`;
  });

  return result;
}
