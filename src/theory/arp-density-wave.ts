/**
 * Arp density wave — arp note density breathes independently.
 *
 * The arp layer should have its own density breathing pattern,
 * separate from the global density wave. When the arp thickens,
 * it creates energy; when it thins, it creates space. This
 * independent rhythm creates polyrhythmic density interaction
 * between arp and other layers.
 *
 * Applied as a degradeBy value that oscillates over time.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood arp breathing amplitude.
 */
const ARP_BREATH_AMPLITUDE: Record<Mood, number> = {
  trance:    0.15,  // subtle breath
  avril:     0.30,  // moderate breathing
  disco:     0.20,  // groove consistency
  downtempo: 0.35,  // noticeable
  blockhead: 0.25,  // choppy
  lofi:      0.40,  // jazz breathing
  flim:      0.35,  // organic
  xtal:      0.45,  // maximum arp breathing
  syro:      0.20,  // controlled
  ambient:   0.50,  // spacious breathing,
  plantasia: 0.50,
};

/**
 * Per-mood arp breathing period (ticks per cycle).
 */
const ARP_BREATH_PERIOD: Record<Mood, number> = {
  trance:    6,
  avril:     10,
  disco:     5,
  downtempo: 12,
  blockhead: 7,
  lofi:      8,
  flim:      10,
  xtal:      14,
  syro:      5,
  ambient:   16,
  plantasia: 16,
};

/**
 * Calculate arp density degradeBy value.
 * Oscillates between 0 (full density) and amplitude (sparse).
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns DegradeBy value (0-0.5)
 */
export function arpDensityDegrade(
  tick: number,
  mood: Mood,
  section: Section
): number {
  const amplitude = ARP_BREATH_AMPLITUDE[mood];
  const period = ARP_BREATH_PERIOD[mood];

  const sectionMult: Record<Section, number> = {
    intro:     1.3,   // more breathing
    build:     0.6,   // denser
    peak:      0.4,   // densest
    breakdown: 1.5,   // most breathing
    groove:    1.0,
  };

  const phase = (tick / period) * 2 * Math.PI;
  // Use abs(sin) so density only reduces, never adds
  const wave = Math.abs(Math.sin(phase));
  return Math.min(0.5, wave * amplitude * (sectionMult[section] ?? 1.0));
}

/**
 * Should arp density wave be applied?
 */
export function shouldApplyArpDensityWave(mood: Mood): boolean {
  return ARP_BREATH_AMPLITUDE[mood] > 0.12;
}

/**
 * Get arp breath amplitude for a mood (for testing).
 */
export function arpBreathAmplitude(mood: Mood): number {
  return ARP_BREATH_AMPLITUDE[mood];
}

/**
 * Get arp breath period for a mood (for testing).
 */
export function arpBreathPeriod(mood: Mood): number {
  return ARP_BREATH_PERIOD[mood];
}
