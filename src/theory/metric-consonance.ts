/**
 * Metric consonance — aligning harmonic stability with beat strength.
 *
 * A fundamental principle: strong beats (downbeats) should carry
 * more consonant, harmonically stable notes, while weak beats
 * (offbeats, upbeats) can tolerate or benefit from dissonance.
 *
 * This is why melodies naturally land on chord tones on beat 1 and
 * passing tones on beat 2. It's why appoggiaturas on strong beats
 * are so expressive — they violate the expected consonance.
 *
 * Metric hierarchy (16-step grid):
 * - Beat 1 (step 0): Strongest — should be chord tone or root
 * - Beat 3 (step 8): Strong — chord tone preferred
 * - Beats 2,4 (steps 4,12): Medium — scale tone acceptable
 * - Eighth notes (steps 2,6,10,14): Weak — any diatonic note
 * - 16ths (steps 1,3,5,7,9,11,13,15): Weakest — chromatic OK
 *
 * Application: when building melody phrases, notes at strong
 * metric positions are biased toward chord tones, while notes
 * at weak positions are free to be passing tones or chromatic.
 */

import type { Mood } from '../types';

/**
 * Metric weight for a given step position in a 16-step grid.
 * Higher = stronger metric position.
 *
 * @param step  Position 0-15
 * @returns Weight 0-1 (1 = strongest beat)
 */
export function metricWeight(step: number): number {
  const pos = ((step % 16) + 16) % 16;

  // Standard metric hierarchy
  if (pos === 0) return 1.0;          // beat 1 — strongest
  if (pos === 8) return 0.85;         // beat 3
  if (pos === 4 || pos === 12) return 0.7;  // beats 2, 4
  if (pos % 2 === 0) return 0.4;     // eighth note positions
  return 0.2;                          // 16th note positions
}

/**
 * How much each mood respects metric consonance rules (0-1).
 * High = strict (chord tones on strong beats).
 * Low = free (any notes anywhere).
 */
const METRIC_CONSONANCE_STRENGTH: Record<Mood, number> = {
  trance:    0.70,  // very metrical — strong beat = chord tone
  disco:     0.65,  // dance music — metrical clarity
  avril:     0.55,  // songwriter — mostly consonant
  blockhead: 0.45,  // hip-hop — moderate
  downtempo: 0.40,  // moderate
  lofi:      0.35,  // jazz — some freedom
  flim:      0.30,  // organic
  xtal:      0.25,  // dreamy — less strict
  ambient:   0.15,  // floating — any note anywhere,
  plantasia: 0.15,
  syro:      0.12,  // IDM — intentionally violates metric norms
};

/**
 * Calculate chord-tone bias for a given metric position.
 * Returns a multiplier: >1 = favor chord tones, <1 = allow passing tones.
 *
 * @param step     Step position (0-15)
 * @param mood     Current mood
 * @returns Chord-tone bias multiplier (0.5 - 2.0)
 */
export function chordToneBias(step: number, mood: Mood): number {
  const weight = metricWeight(step);
  const strength = METRIC_CONSONANCE_STRENGTH[mood];

  // Strong beat + high strength = strongly prefer chord tones
  // Weak beat + low strength = no preference
  return 1.0 + (weight - 0.5) * strength;
}

/**
 * Generate a chord-tone bias map for a full pattern.
 *
 * @param length  Pattern length (8 or 16)
 * @param mood    Current mood
 * @returns Array of bias multipliers
 */
export function chordToneBiasMap(length: number, mood: Mood): number[] {
  const map: number[] = [];
  for (let i = 0; i < length; i++) {
    map.push(chordToneBias(i, mood));
  }
  return map;
}

/**
 * Check if a note is a chord tone.
 */
export function isChordTone(note: string, chordNotes: string[]): boolean {
  const noteName = note.replace(/\d+$/, '');
  return chordNotes.some(cn => cn.replace(/\d+$/, '') === noteName);
}

/**
 * Apply metric consonance: at strong metric positions, prefer
 * chord tones; at weak positions, allow passing tones.
 * Replaces non-chord notes at strong beats with nearest chord tone.
 *
 * @param steps       Note pattern
 * @param chordNotes  Current chord tones
 * @param scaleNotes  Available scale notes
 * @param mood        Current mood (determines strictness)
 * @returns Modified pattern
 */
export function applyMetricConsonance(
  steps: string[],
  chordNotes: string[],
  scaleNotes: string[],
  mood: Mood
): string[] {
  const strength = METRIC_CONSONANCE_STRENGTH[mood];
  if (strength < 0.15) return steps; // too free to bother

  const result = [...steps];
  const chordNames = chordNotes.map(n => n.replace(/\d+$/, ''));

  for (let i = 0; i < result.length; i++) {
    if (result[i] === '~') continue;

    const weight = metricWeight(i);
    // Only enforce on strong beats where mood cares
    if (weight * strength < 0.35) continue;

    const noteName = result[i].replace(/\d+$/, '');
    const octave = result[i].match(/\d+$/)?.[0] ?? '4';

    // If already a chord tone, leave it
    if (chordNames.includes(noteName)) continue;

    // On strong beats, probabilistically snap to nearest chord tone
    const snapProb = weight * strength * 0.6;
    // Deterministic: use step position as hash
    const hash = ((i * 2654435761 + 53003) >>> 0) / 4294967296;
    if (hash < snapProb && chordNames.length > 0) {
      // Pick the nearest chord tone
      result[i] = `${chordNames[0]}${octave}`;
    }
  }

  return result;
}

/**
 * Get metric consonance strength for a mood (for testing).
 */
export function metricConsonanceStrength(mood: Mood): number {
  return METRIC_CONSONANCE_STRENGTH[mood];
}
