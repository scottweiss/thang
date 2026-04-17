/**
 * Staggered harmonic changes for organic voice movement.
 *
 * In real music, not all instruments change chords at exactly the same
 * moment. A bass player might anticipate the change by a beat, a pad
 * might sustain the old chord for an extra beat. This staggering creates
 * brief, musical dissonances that make harmonic motion feel alive.
 *
 * This module provides tick-based delays per layer so chord changes
 * ripple through the ensemble rather than snapping all at once.
 */

import type { Mood } from '../types';

export interface StaggerConfig {
  drone: number;     // ticks of delay (0 = immediate)
  harmony: number;
  melody: number;
  arp: number;
}

/**
 * Get stagger delays for each layer based on mood.
 * Values are in ticks (each tick = ~2 seconds).
 *
 * Energetic moods (trance, disco) have tighter staggering.
 * Relaxed moods (ambient, xtal) have wider staggering for dreamy overlap.
 */
const MOOD_STAGGER: Record<Mood, StaggerConfig> = {
  ambient:   { drone: 0, harmony: 1, melody: 2, arp: 1 },
  plantasia: { drone: 0, harmony: 1, melody: 2, arp: 1 },
  downtempo: { drone: 0, harmony: 0, melody: 1, arp: 1 },
  lofi:      { drone: 0, harmony: 0, melody: 1, arp: 0 },
  trance:    { drone: 0, harmony: 0, melody: 0, arp: 0 },  // tight sync
  avril:     { drone: 0, harmony: 1, melody: 1, arp: 1 },
  xtal:      { drone: 0, harmony: 1, melody: 2, arp: 2 },  // dreamy overlap
  syro:      { drone: 0, harmony: 0, melody: 0, arp: 0 },  // machine precision
  blockhead: { drone: 0, harmony: 0, melody: 1, arp: 0 },
  flim:      { drone: 0, harmony: 1, melody: 1, arp: 1 },
  disco:     { drone: 0, harmony: 0, melody: 0, arp: 0 },  // tight groove
};

/**
 * Should a layer accept a chord change this tick?
 *
 * @param layerName    Name of the layer
 * @param mood         Current mood
 * @param ticksSinceChordChange  How many ticks since the chord changed
 * @returns true if this layer should update its chord this tick
 */
export function shouldLayerAcceptChordChange(
  layerName: string,
  mood: Mood,
  ticksSinceChordChange: number
): boolean {
  const config = MOOD_STAGGER[mood];
  const delay = (config as unknown as Record<string, number>)[layerName];
  if (delay === undefined) return true; // unknown layers change immediately
  return ticksSinceChordChange >= delay;
}

export function getStaggerConfig(mood: Mood): StaggerConfig {
  return MOOD_STAGGER[mood];
}
