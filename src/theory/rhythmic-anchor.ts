/**
 * Rhythmic Anchor — core rhythmic cell for cross-layer unity.
 *
 * Generates a rhythmic pattern (hit/rest mask) that defines the piece's
 * rhythmic identity. Each layer applies a filtered version of this pattern
 * to bias its note placement, creating rhythmic cohesion without unison.
 */
import type { Mood, Section } from '../types';

/** A rhythmic cell as a boolean mask over 16 sixteenth-note slots */
export type RhythmCell = boolean[];

/** Per-mood rhythmic cell templates - curated to match mood character */
const CELL_TEMPLATES: Record<Mood, RhythmCell[]> = {
  // Format: 16 slots = 1 bar of sixteenth notes. true = accent, false = rest
  ambient: [
    [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  ],
  plantasia: [
    [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  ],
  downtempo: [
    [true, false, false, true, false, false, true, false, false, false, true, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, true, false, false, false, false],
  ],
  lofi: [
    [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false],
    [true, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false],
  ],
  trance: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
  ],
  avril: [
    [true, false, false, false, false, true, false, false, false, false, true, false, false, false, false, false],
    [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
  ],
  xtal: [
    [true, false, true, false, false, true, false, true, false, false, true, false, false, false, true, false],
    [true, false, false, true, false, true, false, false, true, false, true, false, false, true, false, false],
  ],
  syro: [
    [true, true, false, true, false, false, true, false, true, false, false, true, false, true, false, false],
    [true, false, true, false, true, true, false, false, true, false, true, false, false, true, true, false],
  ],
  blockhead: [
    [true, false, false, true, false, true, false, false, true, false, false, true, false, false, true, false],
    [true, false, true, false, false, true, false, true, false, false, true, false, true, false, false, true],
  ],
  flim: [
    [true, false, false, true, false, false, false, true, false, false, true, false, false, false, true, false],
    [true, false, false, false, true, false, false, true, false, false, false, true, false, false, true, false],
  ],
  disco: [
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    [true, false, false, true, true, false, true, false, false, true, false, false, true, false, true, false],
  ],
};

/** Generate a rhythmic cell for the current piece */
export function generateRhythmCell(mood: Mood): RhythmCell {
  const templates = CELL_TEMPLATES[mood];
  return [...templates[Math.floor(Math.random() * templates.length)]];
}

/**
 * Per-layer adherence — how strongly each layer follows the anchor.
 * 1.0 = must follow exactly, 0.0 = ignore completely.
 * Texture (drums) follows most tightly since it IS the groove.
 * Atmosphere follows least since it's ambient texture.
 */
const LAYER_ADHERENCE: Record<string, Record<Mood, number>> = {
  texture:    { ambient: 0.0, downtempo: 0.7, lofi: 0.8, trance: 0.9, avril: 0.3, xtal: 0.5, syro: 0.6, blockhead: 0.8, flim: 0.5, disco: 0.9, plantasia: 0.0 },
  drone:      { ambient: 0.3, downtempo: 0.5, lofi: 0.6, trance: 0.7, avril: 0.3, xtal: 0.4, syro: 0.4, blockhead: 0.5, flim: 0.4, disco: 0.6, plantasia: 0.3 },
  arp:        { ambient: 0.2, downtempo: 0.5, lofi: 0.5, trance: 0.6, avril: 0.3, xtal: 0.5, syro: 0.4, blockhead: 0.6, flim: 0.4, disco: 0.7, plantasia: 0.3 },
  melody:     { ambient: 0.1, downtempo: 0.3, lofi: 0.3, trance: 0.4, avril: 0.2, xtal: 0.3, syro: 0.2, blockhead: 0.4, flim: 0.3, disco: 0.4, plantasia: 0.2 },
  harmony:    { ambient: 0.1, downtempo: 0.2, lofi: 0.3, trance: 0.3, avril: 0.1, xtal: 0.2, syro: 0.2, blockhead: 0.3, flim: 0.2, disco: 0.3, plantasia: 0.2 },
  atmosphere: { ambient: 0.0, downtempo: 0.1, lofi: 0.1, trance: 0.1, avril: 0.0, xtal: 0.1, syro: 0.1, blockhead: 0.1, flim: 0.1, disco: 0.1, plantasia: 0.1 },
};

/** Get how strongly a layer should follow the rhythmic anchor */
export function layerAdherence(layerName: string, mood: Mood): number {
  return LAYER_ADHERENCE[layerName]?.[mood] ?? 0.0;
}

/**
 * Apply rhythmic anchor bias to a step mask.
 * Given an array of step positions (0-15 for sixteenth notes),
 * returns a gain multiplier per step. Steps aligned with the anchor
 * get boosted; steps against it get dampened.
 *
 * adherence controls the effect strength (0 = no effect, 1 = full).
 */
export function anchorGainBias(
  cell: RhythmCell,
  stepIndex: number,
  adherence: number,
): number {
  if (adherence <= 0 || !cell || cell.length === 0) return 1.0;
  const normalizedStep = stepIndex % cell.length;
  const isAnchorHit = cell[normalizedStep];

  if (isAnchorHit) {
    // Boost notes that land on anchor beats
    return 1.0 + adherence * 0.15;  // up to +15% gain
  } else {
    // Slightly dampen notes that don't align
    return 1.0 - adherence * 0.10;  // up to -10% gain
  }
}

/**
 * Section-modulated adherence. Builds and peaks tighten the groove;
 * breakdowns and intros loosen it.
 */
export function sectionAdherenceMultiplier(section: Section): number {
  switch (section) {
    case 'intro': return 0.5;
    case 'build': return 1.2;
    case 'peak': return 1.3;
    case 'breakdown': return 0.6;
    case 'groove': return 1.0;
  }
}
