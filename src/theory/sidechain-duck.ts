/**
 * Sidechain ducking — rhythmic gain pumping on strong beats.
 *
 * The defining sound of EDM: on each kick drum hit, the other layers
 * briefly dip in volume and recover, creating a "breathing" or "pumping"
 * effect that gives the music its characteristic energy and groove.
 *
 * Implemented as per-step gain multipliers shaped like an exponential
 * recovery curve from the beat position:
 * - Beat hit: gain drops to (1 - depth)
 * - Recovery: exponential rise back to 1.0 over the next steps
 *
 * The effect is strongest for trance/disco/syro and absent for ambient.
 * Only applies to layers that should duck (drone, harmony, arp, atmosphere).
 */

import type { Mood, Section } from '../types';

/** Per-mood ducking depth (0 = none, 1 = full mute on beat) */
const DUCK_DEPTH: Record<Mood, number> = {
  trance:    0.35,   // pronounced pumping — classic EDM
  disco:     0.30,   // funky pump — drives the groove
  syro:      0.25,   // IDM — noticeable but quirky
  blockhead: 0.20,   // hip-hop — subtle bounce
  downtempo: 0.12,   // smooth — gentle breathing
  lofi:      0.10,   // chill — barely there
  flim:      0.08,   // delicate — hint of movement
  xtal:      0.05,   // dreamy — very subtle
  avril:     0.03,   // intimate — almost none
  ambient:   0.00,   // static — no ducking
};

/** Recovery rate — how quickly gain returns (higher = faster) */
const RECOVERY_RATE: Record<Mood, number> = {
  trance:    3.0,    // snappy — quick return for driving feel
  disco:     2.5,    // funky — medium recovery
  syro:      4.0,    // very snappy — tight IDM pumping
  blockhead: 2.0,    // relaxed bounce
  downtempo: 1.5,    // slow breathing
  lofi:      1.5,
  flim:      1.5,
  xtal:      1.0,
  avril:     1.0,
  ambient:   1.0,
};

/** Section multiplier — peaks pump harder, breakdowns soften */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.3,
  build:     0.7,
  peak:      1.0,
  breakdown: 0.2,
  groove:    0.85,
};

/**
 * Generate per-step gain multipliers for sidechain ducking.
 *
 * The pattern assumes kicks on beats 1 and 3 (positions 0 and steps/2
 * in a 4/4 bar). Each kick triggers an exponential recovery curve.
 *
 * @param steps   Number of steps in the pattern (typically 8 or 16)
 * @param mood    Current mood (controls depth and recovery)
 * @param section Current section (peaks pump harder)
 * @returns Array of gain multipliers (same length as steps)
 */
export function sidechainGainPattern(
  steps: number,
  mood: Mood,
  section: Section
): number[] {
  const depth = DUCK_DEPTH[mood] * SECTION_MULT[section];
  if (depth < 0.02) return new Array(steps).fill(1.0);

  const rate = RECOVERY_RATE[mood];
  const gains = new Array(steps).fill(1.0);
  const halfBar = Math.floor(steps / 2);

  // Kick positions: beat 1 (step 0) and beat 3 (step halfBar)
  const kickPositions = [0, halfBar];

  for (const kickPos of kickPositions) {
    for (let i = 0; i < steps; i++) {
      // Distance from this kick (wrapping)
      const dist = (i - kickPos + steps) % steps;
      if (dist >= halfBar) continue; // Only affect up to the next kick

      // Exponential recovery: starts at (1 - depth), rises to 1.0
      const t = dist / halfBar; // 0 at kick, 1 at next kick
      const recovery = 1.0 - depth * Math.exp(-rate * t);
      gains[i] = Math.min(gains[i], recovery);
    }
  }

  return gains;
}

/**
 * Which layers should be ducked. Melody is excluded (leads shouldn't pump).
 */
export function shouldDuckLayer(layerName: string): boolean {
  return layerName === 'drone' || layerName === 'harmony' ||
         layerName === 'arp' || layerName === 'atmosphere';
}

/**
 * Whether sidechain ducking should be applied for this mood.
 */
export function shouldApplySidechainDuck(mood: Mood, section: Section): boolean {
  return DUCK_DEPTH[mood] * SECTION_MULT[section] >= 0.03;
}
