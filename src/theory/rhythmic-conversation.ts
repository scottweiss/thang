/**
 * Rhythmic conversation — layers take turns being active.
 *
 * In ensemble playing, not everyone plays all the time. Layers
 * take turns being the "foreground" while others recede. This
 * creates a conversational quality where different voices emerge
 * and submerge organically.
 *
 * Modeled as a "speaking" token that passes between layers.
 * The currently speaking layer gets a gain boost; others get
 * a subtle dip. Token passes based on section progress and
 * musical events.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood strength of conversation effect.
 * Higher = more pronounced turn-taking.
 */
const CONVERSATION_STRENGTH: Record<Mood, number> = {
  trance:    0.10,  // all layers pump together
  avril:     0.30,  // moderate conversation
  disco:     0.15,  // groove-locked
  downtempo: 0.35,  // breathing, conversational
  blockhead: 0.40,  // call-response hip-hop
  lofi:      0.45,  // jazz ensemble dynamics
  flim:      0.40,  // organic interplay
  xtal:      0.35,  // floating, voices emerge
  syro:      0.30,  // complex but less turn-taking
  ambient:   0.25,  // gentle emergence,
  plantasia: 0.25,
};

/** Layer priority for "speaking" (higher = more likely to lead). */
const LAYER_PRIORITY: Record<string, number> = {
  melody: 5,
  arp: 4,
  harmony: 3,
  texture: 2,
  drone: 1,
  atmosphere: 1,
};

/**
 * Determine which layer should be "speaking" (foregrounded).
 * Uses tick-based rotation with mood-specific cycle length.
 *
 * @param activeLayers Set of currently active layer names
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Name of the speaking layer
 */
export function speakingLayer(
  activeLayers: string[],
  tick: number,
  mood: Mood,
  section: Section
): string {
  if (activeLayers.length === 0) return 'melody';
  if (activeLayers.length === 1) return activeLayers[0];

  // Cycle length varies by mood (trance = long cycles, syro = short)
  const cycleLength = Math.max(2, Math.round(8 / (CONVERSATION_STRENGTH[mood] * 3)));

  // Section bias: peaks favor melody, breakdowns favor harmony/drone
  const sectionBias: Record<Section, string[]> = {
    intro: ['drone', 'atmosphere'],
    build: ['melody', 'arp'],
    peak: ['melody', 'texture'],
    breakdown: ['harmony', 'drone'],
    groove: ['arp', 'melody'],
  };

  const phase = Math.floor(tick / cycleLength) % activeLayers.length;
  const biased = sectionBias[section];

  // Sort by priority, then pick based on phase
  const sorted = [...activeLayers].sort((a, b) => {
    const aPriority = (LAYER_PRIORITY[a] ?? 0) + (biased.includes(a) ? 3 : 0);
    const bPriority = (LAYER_PRIORITY[b] ?? 0) + (biased.includes(b) ? 3 : 0);
    return bPriority - aPriority;
  });

  return sorted[phase % sorted.length];
}

/**
 * Calculate gain multiplier for a layer based on conversation state.
 *
 * @param layerName Name of the layer
 * @param speaking Name of the currently speaking layer
 * @param mood Current mood
 * @returns Gain multiplier (speaking = boost, others = dip)
 */
export function conversationGainMultiplier(
  layerName: string,
  speaking: string,
  mood: Mood
): number {
  const strength = CONVERSATION_STRENGTH[mood];
  if (layerName === speaking) {
    return 1.0 + strength * 0.3; // boost speaking layer
  }
  return 1.0 - strength * 0.15; // dip others
}

/**
 * Should conversation dynamics be applied?
 *
 * @param mood Current mood
 * @param activeLayerCount Number of active layers
 * @returns Whether to apply
 */
export function shouldApplyConversation(mood: Mood, activeLayerCount: number): boolean {
  // Need at least 3 layers for meaningful conversation
  if (activeLayerCount < 3) return false;
  return CONVERSATION_STRENGTH[mood] > 0.12;
}

/**
 * Get conversation strength for a mood (for testing).
 */
export function conversationStrength(mood: Mood): number {
  return CONVERSATION_STRENGTH[mood];
}
