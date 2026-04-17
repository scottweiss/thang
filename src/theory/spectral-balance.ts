/**
 * Spectral balance — ensure layers occupy distinct frequency bands
 * by adjusting LPF/HPF based on how many layers share the same range.
 *
 * When multiple layers occupy the same frequency band, they fight
 * for spectral space ("frequency masking"). This module assigns
 * each layer a target frequency band and provides LPF/HPF offsets
 * to keep layers spectrally separated.
 *
 * Band assignments:
 * - Drone: sub-bass to low-mid (40-400 Hz)
 * - Harmony: low-mid to mid (200-2000 Hz)
 * - Melody: mid to upper-mid (400-4000 Hz)
 * - Arp: upper-mid to presence (800-6000 Hz)
 * - Texture: mid to high (300-8000 Hz)
 * - Atmosphere: low to mid (100-1500 Hz)
 *
 * When tension is high and layers are dense, bands tighten further
 * to prevent mud. When sparse, bands can overlap more.
 */

import type { Mood } from '../types';

/** Target center frequency per layer (Hz) */
const LAYER_CENTER_FREQ: Record<string, number> = {
  drone:      150,
  harmony:    600,
  melody:     1200,
  arp:        2000,
  texture:    1000,
  atmosphere: 400,
};

/** Target bandwidth per layer (ratio of center freq) */
const LAYER_BANDWIDTH: Record<string, number> = {
  drone:      2.5,   // wide bass
  harmony:    3.0,   // wide mid range
  melody:     2.5,   // focused mid-upper
  arp:        2.0,   // focused upper
  texture:    4.0,   // wide (drums need range)
  atmosphere: 3.0,   // wide ambient wash
};

/** How aggressively to separate bands per mood (0-1) */
const SEPARATION_STRENGTH: Record<Mood, number> = {
  lofi:      0.45,   // clarity important
  downtempo: 0.40,   // warm but clear
  disco:     0.40,   // punchy separation
  blockhead: 0.40,   // hip-hop clarity
  trance:    0.35,   // power but some overlap OK
  syro:      0.30,   // IDM allows some clash
  avril:     0.35,   // intimate clarity
  flim:      0.30,   // delicate balance
  xtal:      0.25,   // wash OK for dreamy moods
  ambient:   0.15,   // overlap is fine,
  plantasia: 0.15,
};

/**
 * Compute LPF adjustment for a layer to maintain spectral balance.
 * Returns a multiplier for the layer's LPF (< 1 = darken, > 1 = brighten).
 *
 * @param layerName    Layer to adjust
 * @param activeLayers Currently active layers
 * @param tension      Current tension 0-1
 * @param mood         Current mood
 * @returns LPF multiplier (0.8-1.2)
 */
export function spectralLpfMultiplier(
  layerName: string,
  activeLayers: Set<string>,
  tension: number,
  mood: Mood
): number {
  if (activeLayers.size < 3) return 1.0;

  const strength = SEPARATION_STRENGTH[mood];
  const center = LAYER_CENTER_FREQ[layerName] ?? 1000;

  // Count layers whose center is within 1 octave of this layer
  let neighbors = 0;
  for (const other of activeLayers) {
    if (other === layerName) continue;
    const otherCenter = LAYER_CENTER_FREQ[other] ?? 1000;
    const ratio = center / otherCenter;
    if (ratio > 0.5 && ratio < 2.0) neighbors++;
  }

  if (neighbors === 0) return 1.0;

  // More neighbors = tighter band needed
  // High tension also tightens bands (more energy = more masking)
  const tighten = neighbors * strength * (0.8 + tension * 0.4);

  // Layers above the median get slightly brighter (LPF up)
  // Layers below the median get slightly darker (LPF down)
  const medianCenter = 800;
  if (center > medianCenter) {
    return 1.0 + tighten * 0.05; // open LPF slightly
  } else {
    return 1.0 - tighten * 0.08; // close LPF slightly
  }
}

/**
 * Compute HPF adjustment for a layer.
 * Returns an additive offset in Hz.
 *
 * @param layerName    Layer to adjust
 * @param activeLayers Currently active layers
 * @param tension      Current tension 0-1
 * @param mood         Current mood
 * @returns HPF offset in Hz (0-100)
 */
export function spectralHpfOffset(
  layerName: string,
  activeLayers: Set<string>,
  tension: number,
  mood: Mood
): number {
  if (activeLayers.size < 3) return 0;

  const strength = SEPARATION_STRENGTH[mood];
  const center = LAYER_CENTER_FREQ[layerName] ?? 1000;

  // Low-frequency layers don't need HPF adjustment
  if (center < 300) return 0;

  // Count layers below this one
  let lowerNeighbors = 0;
  for (const other of activeLayers) {
    if (other === layerName) continue;
    const otherCenter = LAYER_CENTER_FREQ[other] ?? 1000;
    if (otherCenter < center && center / otherCenter < 3.0) lowerNeighbors++;
  }

  if (lowerNeighbors === 0) return 0;

  // Push HPF up proportional to how many layers are below
  return lowerNeighbors * strength * (20 + tension * 30);
}

/**
 * Whether spectral balance should be applied.
 */
export function shouldApplySpectralBalance(
  mood: Mood,
  activeLayers: Set<string>
): boolean {
  return activeLayers.size >= 3 && SEPARATION_STRENGTH[mood] >= 0.15;
}

/**
 * Get separation strength for a mood (for testing).
 */
export function spectralSeparationStrength(mood: Mood): number {
  return SEPARATION_STRENGTH[mood];
}
