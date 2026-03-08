/**
 * Drum dynamics — section-responsive velocity contrast for drum patterns.
 *
 * During peaks, the dynamic range widens: accents hit harder, ghost notes
 * get quieter. During breakdowns, everything evens out for a gentler feel.
 * This creates the "drummer playing harder during the chorus" effect.
 *
 * Also provides velocity templates for moods that lack them.
 */

import type { Section } from '../types';

/**
 * Scale a velocity template string by section-appropriate contrast.
 *
 * Takes a space-separated velocity string (e.g., "1 0.3 0.5 0.4")
 * and adjusts the contrast between loud and quiet hits based on section.
 *
 * @param velocityPattern  Space-separated velocity values (0-1)
 * @param section          Current musical section
 * @param tension          0-1 tension level
 * @returns Adjusted velocity pattern string
 */
export function applyDrumDynamics(
  velocityPattern: string,
  section: Section,
  tension: number
): string {
  const values = velocityPattern.split(' ').map(parseFloat);
  if (values.length === 0) return velocityPattern;

  const t = Math.max(0, Math.min(1, tension));

  // Contrast multiplier: how much to exaggerate the difference between
  // accents and ghost notes. Higher = more dynamic range.
  const contrastMap: Record<Section, number> = {
    intro: 0.7,      // gentle, even
    build: 0.9,      // building energy
    peak: 1.3,       // maximum punch
    breakdown: 0.5,   // very gentle
    groove: 1.1,      // solid pocket
  };

  const contrast = (contrastMap[section] ?? 1.0) + t * 0.15;

  // Find the average velocity to use as the pivot point
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const adjusted = values.map(v => {
    // Scale deviation from average by contrast
    const deviation = v - avg;
    const scaled = avg + deviation * contrast;
    return Math.max(0.1, Math.min(1.0, scaled));
  });

  return adjusted.map(v => v.toFixed(2)).join(' ');
}

// Trance velocity templates — driving, mechanical, accented on beats 1&3
export const TRANCE_VELOCITIES = [
  '1 0.4 0.6 0.4 1 0.4 0.6 0.4 1 0.4 0.6 0.4 1 0.4 0.6 0.4',    // four-on-floor
  '1 0.3 0.7 0.3 0.9 0.3 0.7 0.3 1 0.3 0.7 0.4 0.9 0.3 0.6 0.3', // with ghost hats
  '1 0.4 0.5 0.5 1 0.4 0.5 0.6 0.9 0.4 0.5 0.5 1 0.4 0.5 0.4',   // slightly swung
];

// Avril velocity templates — very gentle, barely audible ghost notes
export const AVRIL_VELOCITIES = [
  '0.5 0.2 0.3 0.2 0.4 0.2 0.3 0.2 0.5 0.2 0.3 0.2 0.4 0.2 0.3 0.2',  // whisper
  '0.4 0.2 0.2 0.3 0.5 0.2 0.2 0.3 0.4 0.2 0.3 0.2 0.5 0.2 0.2 0.3',  // gentle sway
];
