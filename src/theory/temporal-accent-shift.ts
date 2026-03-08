/**
 * Temporal accent shift — beat emphasis shifts across sections.
 *
 * The primary accent position can shift subtly through a section:
 * - Early in a section, emphasis on beat 1 (establishment)
 * - Mid-section, emphasis shifts to backbeat (groove)
 * - Late section, emphasis returns to downbeat (resolution)
 *
 * This creates an evolving groove feel without changing patterns.
 */

import type { Mood } from '../types';

/**
 * Per-mood accent shift range (higher = more shift).
 */
const SHIFT_RANGE: Record<Mood, number> = {
  trance:    0.25,  // low — steady pulse
  avril:     0.40,  // moderate — rubato-like
  disco:     0.45,  // moderate — groove evolution
  downtempo: 0.35,  // moderate
  blockhead: 0.50,  // high — hip-hop feel
  lofi:      0.55,  // high — lazy shifting
  flim:      0.40,  // moderate
  xtal:      0.30,  // low — ethereal
  syro:      0.60,  // highest — maximum shift
  ambient:   0.15,  // lowest — stable
};

/**
 * Calculate accent shift gain for a beat position at given progress.
 *
 * @param position Beat position (0-15)
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.08)
 */
export function accentShiftGain(
  position: number,
  sectionProgress: number,
  mood: Mood
): number {
  const range = SHIFT_RANGE[mood];
  const pos = ((position % 16) + 16) % 16;
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Accent target shifts: 0→beat1, 0.5→backbeat, 1.0→beat1
  const accentPhase = Math.sin(t * Math.PI) * range;

  // Downbeat emphasis at section edges, backbeat in middle
  const isDownbeat = pos === 0 || pos === 8;
  const isBackbeat = pos === 4 || pos === 12;

  let emphasis = 0;
  if (isDownbeat) emphasis = 1.0 - accentPhase;
  else if (isBackbeat) emphasis = accentPhase;

  const adjustment = emphasis * 0.08;
  return Math.max(0.92, Math.min(1.08, 1.0 + adjustment));
}

/**
 * Get shift range for a mood (for testing).
 */
export function shiftRange(mood: Mood): number {
  return SHIFT_RANGE[mood];
}
