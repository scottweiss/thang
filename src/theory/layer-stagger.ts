/**
 * Layer stagger — per-layer fade-in rates for section transitions.
 *
 * In professional arrangements, instruments don't all enter at once.
 * The rhythm section arrives first (drums, bass), establishing groove.
 * Then harmony fills in, and finally the melody enters on top.
 * This staggered entry creates musical anticipation and a sense
 * of the arrangement "building up" even within a single transition.
 *
 * Applied by varying the fade-in rate per layer. Layers with higher
 * priority (drums, drone) fade in faster; layers with lower priority
 * (melody, arp) fade in more slowly, arriving a tick or two later.
 *
 * Fade-out is uniform — all layers exit at the same rate for clean drops.
 */

/**
 * Get the fade-in step size for a layer.
 * Higher values = faster fade-in = enters sooner.
 * Base rate is 0.33 per tick (~3 ticks to full).
 *
 * @param layerName  Name of the layer
 * @returns Fade-in step per tick (0-1 scale)
 */
export function layerFadeInRate(layerName: string): number {
  switch (layerName) {
    case 'texture':     return 0.50;  // drums hit first — immediate impact
    case 'drone':       return 0.45;  // bass follows quickly — grounds the rhythm
    case 'atmosphere':  return 0.40;  // texture fills in
    case 'harmony':     return 0.33;  // chords establish — standard rate
    case 'arp':         return 0.28;  // arpeggio enters after chords
    case 'melody':      return 0.22;  // melody last — the reveal
    default:            return 0.33;
  }
}

/**
 * Get the fade-out step size for a layer.
 * Reverse stagger — melody exits first, drums hold the groove longest.
 * This creates a "peeling away" effect where the arrangement thins
 * from the top down, mirroring how a real mix operator would pull faders.
 */
export function layerFadeOutRate(layerName: string): number {
  switch (layerName) {
    case 'melody':      return 0.55;  // melody exits first — the reveal unwound
    case 'arp':         return 0.45;  // arpeggio follows melody out
    case 'harmony':     return 0.40;  // chords thin next
    case 'atmosphere':  return 0.35;  // texture fades
    case 'drone':       return 0.30;  // bass holds longer — grounds the transition
    case 'texture':     return 0.25;  // drums last out — holds groove through change
    default:            return 0.40;
  }
}
