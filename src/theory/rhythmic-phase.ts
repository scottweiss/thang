/**
 * Rhythmic phase offset — shifts pattern start position for inter-layer
 * phasing effects.
 *
 * In real music, instruments rarely start exactly on the same beat.
 * A slight phase offset (1/8 or 1/16 note late) creates:
 * - Interlocking patterns (arp fills gaps left by melody)
 * - Steve Reich-style phasing when combined with different pattern lengths
 * - Natural feel (human players don't lock to a grid)
 *
 * Uses Strudel's .late() to shift pattern timing without changing pitch/rhythm.
 */

import type { Mood, Section } from '../types';

/**
 * Get the rhythmic phase offset for a layer in a given context.
 * Returns a fraction of one cycle to shift (0 = no shift, 0.125 = 1/8 late).
 *
 * @param layer    Layer name
 * @param mood     Current mood
 * @param section  Current section
 * @returns Phase offset as fraction of one cycle (0-0.25)
 */
export function layerPhaseOffset(
  layer: string,
  mood: Mood,
  section: Section
): number {
  if (layer !== 'arp') return 0; // only arp gets phase-shifted for now

  const base = MOOD_PHASE_OFFSET[mood];
  if (base === 0) return 0;

  // More offset in groove/breakdown (settled texture), less in builds/peaks
  const sectionMult = SECTION_PHASE[section];

  return base * sectionMult;
}

/**
 * Whether phase offset should be applied.
 */
export function shouldApplyPhaseOffset(
  layer: string,
  mood: Mood
): boolean {
  if (layer !== 'arp') return false;
  return MOOD_PHASE_OFFSET[mood] > 0;
}

/**
 * Per-mood base phase offset for arp layer.
 * Expressed as fraction of one cycle.
 * 0.125 = 1/8 note offset, 0.0625 = 1/16 note offset
 */
const MOOD_PHASE_OFFSET: Record<Mood, number> = {
  ambient:   0.125,    // 1/8 late — dreamy offset
  xtal:      0.125,    // 1/8 late — phasing shimmer
  flim:      0.0625,   // 1/16 late — delicate shift
  syro:      0.0625,   // 1/16 late — IDM precision offset
  downtempo: 0.125,    // 1/8 late — relaxed groove
  lofi:      0.0625,   // 1/16 late — subtle swing offset
  blockhead: 0.125,    // 1/8 late — hip-hop swing
  avril:     0.0625,   // 1/16 late — gentle offset
  trance:    0,        // no offset — straight 4/4 lock
  disco:     0,        // no offset — funky but locked to grid
};

/** Section multiplier for phase offset */
const SECTION_PHASE: Record<Section, number> = {
  groove:    1.0,     // full offset in groove
  breakdown: 1.0,     // full offset in breakdown
  intro:     0.8,     // mostly offset
  build:     0.5,     // less offset — tightening up
  peak:      0.3,     // minimal — everything should hit together
};
