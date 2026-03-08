/**
 * Dynamic stereo field — layers spread wider at peaks, narrower at intimate sections.
 *
 * Each layer has a "home" pan position to avoid clumping in the center.
 * The stereo width expands and contracts with the musical structure,
 * creating a breathing spatial image that mirrors the emotional arc.
 *
 * Bass-heavy layers (drone, texture/drums) stay near center.
 * Melodic layers spread outward during climactic moments.
 */

import type { Section } from '../types';

/**
 * Base pan positions for each layer — where they "live" in the stereo field.
 * 0.5 = dead center, 0.0 = hard left, 1.0 = hard right.
 *
 * Bass-frequency layers stay centered (psychoacoustic convention).
 * Melodic/harmonic layers are distributed to avoid masking.
 */
const LAYER_PAN_BASE: Record<string, number> = {
  drone: 0.50,      // center — bass anchors the image
  texture: 0.50,    // center — kick/snare convention
  harmony: 0.38,    // slightly left
  melody: 0.62,     // slightly right — opposite harmony
  arp: 0.42,        // slightly left, between center and harmony
  atmosphere: 0.50, // center — uses its own slow LFO for movement
};

/**
 * Maximum pan deviation from base position for each layer.
 * Higher = wider potential spread. Bass layers have minimal spread.
 */
const LAYER_MAX_SPREAD: Record<string, number> = {
  drone: 0.08,      // minimal — keep bass centered
  texture: 0.12,    // slight — drums can spread a bit at peaks
  harmony: 0.20,    // moderate — pads can go wide
  melody: 0.18,     // moderate — lead needs presence but can breathe
  arp: 0.22,        // wide — arps benefit from stereo movement
  atmosphere: 0.30, // widest — atmosphere IS the spatial bed
};

/**
 * Compute the stereo width multiplier for a given section and tension.
 *
 * Returns 0-1 where 0 = everything collapsed to center and 1 = full spread.
 * Peak sections with high tension create the widest field.
 * Intros and breakdowns pull everything toward mono.
 *
 * @param section  Current musical section
 * @param tension  0-1 overall tension level
 * @returns Width multiplier (0-1)
 */
export function stereoWidth(section: Section, tension: number): number {
  const clampedTension = Math.max(0, Math.min(1, tension));

  const sectionBase: Record<Section, number> = {
    intro: 0.25,
    build: 0.55,
    peak: 0.85,
    breakdown: 0.30,
    groove: 0.70,
  };

  const base = sectionBase[section] ?? 0.5;
  // Tension pushes width wider (up to +0.15)
  return Math.min(1, base + clampedTension * 0.15);
}

/**
 * Get the pan LFO range for a layer — the min/max bounds for stereo sweep.
 *
 * During narrow sections (intro/breakdown), the range is tight around center.
 * During wide sections (peak/groove), the range opens up.
 *
 * @param layerName  Name of the layer
 * @param section    Current musical section
 * @param tension    0-1 tension level
 * @returns { min, max } pan bounds for LFO range
 */
export function panRange(
  layerName: string,
  section: Section,
  tension: number
): { min: number; max: number } {
  const base = LAYER_PAN_BASE[layerName] ?? 0.5;
  const maxSpread = LAYER_MAX_SPREAD[layerName] ?? 0.15;
  const width = stereoWidth(section, tension);

  const spread = maxSpread * width;

  // Clamp to [0, 1] range
  const min = Math.max(0, base - spread);
  const max = Math.min(1, base + spread);

  return { min: parseFloat(min.toFixed(3)), max: parseFloat(max.toFixed(3)) };
}

/**
 * Get the LFO speed for stereo panning based on layer character.
 *
 * Slow layers (drone, atmosphere) sweep very slowly.
 * Rhythmic layers (arp) can sweep faster.
 * Returns a value suitable for .slow() — higher = slower.
 *
 * @param layerName  Name of the layer
 * @returns .slow() value for the pan LFO
 */
export function panLfoSpeed(layerName: string): number {
  const speeds: Record<string, number> = {
    drone: 31,       // glacial
    atmosphere: 19,  // very slow
    harmony: 13,     // slow
    melody: 7,       // moderate
    texture: 11,     // moderate-slow
    arp: 5,          // faster — rhythmic movement
  };

  return speeds[layerName] ?? 11;
}
