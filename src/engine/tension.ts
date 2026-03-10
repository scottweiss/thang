import type { Section, ChordQuality } from '../types';
import { resolutionPull as chordResolutionPull } from '../theory/chord-tension';

export interface TensionState {
  structural: number;   // from section position (0-1)
  harmonic: number;     // from chord distance to tonic (0-1)
  rhythmic: number;     // from density (0-1)
  overall: number;      // weighted combination (0-1)
  /** Independent emotional axes */
  energy?: number;        // density + volume + tempo feel (0-1)
  intimacy?: number;      // inverse of spaciousness + arrangement density (0-1, high = intimate/close)
  resolutionPull?: number; // how strongly current chord wants to resolve (0-1)
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
 * The overall value provides backward-compatible single-number tension.
 * Independent axes (energy, intimacy, resolutionPull) enable nuanced
 * per-layer responses to different emotional dimensions.
 */
export function computeTension(
  section: Section,
  density: number,
  brightness: number,
  harmonicDistance: number,
  spaciousness?: number,
  activeLayerCount?: number,
  chordDegree?: number,
  chordQuality?: ChordQuality,
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

  // Energy: high density + high brightness + high structural tension
  const energy = Math.min(1, Math.max(0,
    density * 0.4 + brightness * 0.3 + structural * 0.3
  ));

  // Intimacy: inverse of spaciousness, modulated by arrangement density
  // Few layers + dry = intimate. Many layers + wet = spacious/distant
  const layerDensity = Math.min(1, (activeLayerCount ?? 3) / 6);
  const intimacy = Math.min(1, Math.max(0,
    1.0 - (spaciousness ?? 0.5) * 0.6 - layerDensity * 0.4
  ));

  // Resolution pull: reuse chord-tension module for musically accurate values
  const pull = (chordDegree !== undefined && chordQuality !== undefined)
    ? chordResolutionPull(chordDegree, chordQuality as ChordQuality)
    : 0.3;  // moderate default when chord info unavailable

  return { structural, harmonic, rhythmic, overall, energy, intimacy, resolutionPull: pull };
}
