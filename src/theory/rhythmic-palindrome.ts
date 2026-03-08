/**
 * Rhythmic palindrome — mirror patterns for structural coherence.
 *
 * Palindromic rhythm (patterns that read the same forwards and backwards)
 * creates a sense of symmetry and return. This module detects when
 * palindrome patterns should be used and provides pattern symmetry scores.
 *
 * Applied as pattern selection bias toward symmetric rhythms.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood palindrome affinity (higher = more symmetrical patterns).
 */
const PALINDROME_AFFINITY: Record<Mood, number> = {
  trance:    0.45,  // moderate — regular patterns
  avril:     0.50,  // strong — classical symmetry
  disco:     0.30,  // moderate — some symmetry
  downtempo: 0.35,  // moderate
  blockhead: 0.20,  // weak — asymmetric hip-hop
  lofi:      0.40,  // moderate — jazz symmetry
  flim:      0.55,  // strong — delicate symmetry
  xtal:      0.60,  // strongest — crystalline symmetry
  syro:      0.15,  // weakest — asymmetric IDM
  ambient:   0.50,  // strong — meditative symmetry
};

/**
 * Section multipliers for palindrome tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more symmetry in intro
  build:     0.8,   // less as energy builds
  peak:      0.6,   // least at peak (forward energy)
  breakdown: 1.3,   // most in reflective breakdown
  groove:    0.9,   // moderate
};

/**
 * Calculate palindrome symmetry score for a rhythm pattern.
 * Higher score = more palindromic.
 *
 * @param pattern Array of note active flags (true = note, false = rest)
 * @returns Symmetry score (0.0 - 1.0)
 */
export function palindromeScore(pattern: boolean[]): number {
  if (pattern.length <= 1) return 1.0;
  let matches = 0;
  const len = pattern.length;
  for (let i = 0; i < Math.floor(len / 2); i++) {
    if (pattern[i] === pattern[len - 1 - i]) matches++;
  }
  return matches / Math.floor(len / 2);
}

/**
 * Whether to prefer palindromic patterns.
 *
 * @param tick Current tick for deterministic hash
 * @param mood Current mood
 * @param section Current section
 * @returns true if palindrome should be preferred
 */
export function shouldPreferPalindrome(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const affinity = PALINDROME_AFFINITY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 433494437) >>> 0) / 4294967296;
  return hash < affinity;
}

/**
 * Get palindrome affinity for a mood (for testing).
 */
export function palindromeAffinity(mood: Mood): number {
  return PALINDROME_AFFINITY[mood];
}
