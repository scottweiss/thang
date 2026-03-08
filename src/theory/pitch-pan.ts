/**
 * Pitch-based pan positioning — spatial staging by register.
 *
 * In an orchestra, instruments are physically arranged left-to-right
 * roughly by register: basses on the left, violins on the right.
 * This creates a natural spatial association where lower = left and
 * higher = right.
 *
 * Applying subtle per-note pan shifts based on pitch register creates
 * a living, spatial melody that "moves" across the stereo field as
 * it rises and falls. The effect should be subtle (±0.15 from center)
 * to avoid distracting stereo movement.
 *
 * Different moods need different amounts:
 * - Ambient/xtal: wider panning (immersive, spatial)
 * - Trance/disco: narrow panning (center-focused, punchy)
 * - Lofi/blockhead: moderate panning (chill, spacious)
 */

import type { Mood } from '../types';

/**
 * Generate per-step pan values based on note pitches.
 *
 * @param elements   Step array (notes and rests)
 * @param mood       Current mood (determines width)
 * @param restToken  Rest marker
 * @returns Space-separated pan values (0.0-1.0, 0.5 = center)
 */
export function pitchPanPattern(
  elements: string[],
  mood: Mood,
  restToken: string = '~'
): string {
  const width = MOOD_PAN_WIDTH[mood];
  if (width < 0.02) {
    // Too narrow — just use center
    return elements.map(() => '0.50').join(' ');
  }

  // Find pitch range in the current phrase
  let minPitch = Infinity;
  let maxPitch = -Infinity;
  const pitches: (number | null)[] = [];

  for (const el of elements) {
    if (el === restToken) {
      pitches.push(null);
      continue;
    }
    const p = approxPitch(el);
    if (p >= 0) {
      pitches.push(p);
      if (p < minPitch) minPitch = p;
      if (p > maxPitch) maxPitch = p;
    } else {
      pitches.push(null);
    }
  }

  const range = maxPitch - minPitch;
  if (range <= 0) {
    return elements.map(() => '0.50').join(' ');
  }

  // Map each pitch to a pan position
  // center ± width, where lower pitches go slightly left
  const center = 0.5;
  return pitches.map(p => {
    if (p === null) return center.toFixed(2);
    const normalized = (p - minPitch) / range; // 0 = lowest, 1 = highest
    const pan = center + (normalized - 0.5) * width * 2;
    return Math.max(0.15, Math.min(0.85, pan)).toFixed(2);
  }).join(' ');
}

/**
 * Whether pitch-based panning should be applied.
 */
export function shouldApplyPitchPan(mood: Mood): boolean {
  return MOOD_PAN_WIDTH[mood] >= 0.03;
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return -1;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** Pan width per mood (±this value from center) */
const MOOD_PAN_WIDTH: Record<Mood, number> = {
  ambient:   0.15,   // wide — immersive spatial field
  xtal:      0.14,   // wide — dreamy movement
  flim:      0.12,   // moderate — delicate spatial play
  avril:     0.10,   // moderate — intimate but spatial
  lofi:      0.08,   // subtle — chill stereo presence
  downtempo: 0.08,   // subtle
  blockhead: 0.06,   // slight — focused but alive
  syro:      0.10,   // moderate — IDM spatial interest
  disco:     0.04,   // narrow — center punch
  trance:    0.03,   // narrow — driving center focus
};
