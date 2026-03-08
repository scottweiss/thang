import type { Section } from '../types';

export interface TensionState {
  structural: number;   // from section position (0-1)
  harmonic: number;     // from chord distance to tonic (0-1)
  rhythmic: number;     // from density (0-1)
  overall: number;      // weighted combination (0-1)
}

// How much each section contributes to structural tension
const SECTION_TENSION: Record<Section, number> = {
  intro: 0.15,
  build: 0.55,
  peak: 0.9,
  breakdown: 0.25,
  groove: 0.7,
};

/**
 * Compute a multi-dimensional tension state.
 *
 * Tension drives everything: harmonic rhythm, note density,
 * filter openness, layer activity, and dynamic mixing.
 * A single unified value that all layers can read.
 */
export function computeTension(
  section: Section,
  density: number,
  brightness: number,
  harmonicDistance: number,
): TensionState {
  const structural = SECTION_TENSION[section];
  const rhythmic = density;
  const harmonic = harmonicDistance;

  // Weighted blend — structural dominates, harmonic adds color
  const overall = Math.min(1, Math.max(0,
    structural * 0.45 +
    rhythmic * 0.2 +
    brightness * 0.1 +
    harmonic * 0.25
  ));

  return { structural, harmonic, rhythmic, overall };
}
