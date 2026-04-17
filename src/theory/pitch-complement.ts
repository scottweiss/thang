/**
 * Pitch-class complementarity — layers fill each other's harmonic gaps.
 *
 * When melody plays chord tones 3 and 5, arp should prefer root and 7th.
 * When melody plays non-chord tones (passing/neighbor), arp anchors on
 * chord tones. This creates a richer harmonic field where each layer
 * contributes unique content rather than doubling.
 *
 * Based on complementary set theory: given a set of active pitches,
 * the complement set contains the remaining scale degrees, weighted
 * by harmonic importance.
 */

import type { Mood } from '../types';

/**
 * Given a set of "active" pitch classes (from melody/harmony) and
 * the available scale notes, return weight multipliers for each
 * scale note. Notes NOT in the active set get boosted; notes IN
 * the active set get reduced (but not eliminated).
 *
 * @param activeNotes    Currently sounding note names (e.g., ['E', 'G'])
 * @param scaleNotes     Available scale notes (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param chordNotes     Current chord note names (for importance weighting)
 * @param strength       How strongly to apply complementarity (0-1)
 * @returns Map of note name → weight multiplier (>1 = preferred, <1 = avoided)
 */
export function complementWeights(
  activeNotes: string[],
  scaleNotes: string[],
  chordNotes: string[],
  strength: number = 0.5
): Map<string, number> {
  const weights = new Map<string, number>();
  const activeSet = new Set(activeNotes.map(stripOctave));
  const chordSet = new Set(chordNotes.map(stripOctave));
  const s = Math.max(0, Math.min(1, strength));

  for (const note of scaleNotes) {
    const pc = stripOctave(note);
    const isActive = activeSet.has(pc);
    const isChord = chordSet.has(pc);

    if (isActive) {
      // Already sounding — reduce weight (avoid doubling)
      // But chord tones still get reasonable weight (doubling chord tones is fine)
      const reduction = isChord ? 0.15 * s : 0.3 * s;
      weights.set(pc, 1.0 - reduction);
    } else if (isChord) {
      // Not sounding but IS a chord tone — boost (fills harmonic gap)
      weights.set(pc, 1.0 + 0.4 * s);
    } else {
      // Neither sounding nor chord tone — neutral to slight boost
      weights.set(pc, 1.0 + 0.1 * s);
    }
  }

  return weights;
}

/**
 * Apply complement weights to a note selection ladder.
 * Returns indices weighted by complementarity — higher weight = more likely.
 *
 * @param ladder         Available notes in order (e.g., ['C3', 'D3', 'E3', ...])
 * @param weights        From complementWeights()
 * @returns Array of weights aligned with ladder indices
 */
export function weightLadder(
  ladder: string[],
  weights: Map<string, number>
): number[] {
  return ladder.map(note => {
    const pc = stripOctave(note);
    return weights.get(pc) ?? 1.0;
  });
}

/**
 * Weighted random selection from a ladder using complement weights.
 * Returns the index of the selected note.
 */
export function selectComplement(
  ladder: string[],
  weights: number[]
): number {
  if (ladder.length === 0) return 0;

  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return Math.floor(Math.random() * ladder.length);

  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * How strongly pitch complementarity should be applied for this mood.
 * Jazz/IDM moods benefit more; ambient/trance less.
 */
export function complementStrength(mood: Mood): number {
  return MOOD_COMPLEMENT_STRENGTH[mood];
}

/**
 * Whether to apply pitch complementarity.
 */
export function shouldApplyComplement(mood: Mood): boolean {
  return MOOD_COMPLEMENT_STRENGTH[mood] > 0.05;
}

const MOOD_COMPLEMENT_STRENGTH: Record<Mood, number> = {
  lofi:      0.5,    // jazz voicing — avoid doubling
  downtempo: 0.4,    // clear harmony
  blockhead: 0.45,   // jazzy hip-hop
  flim:      0.35,   // delicate separation
  avril:     0.3,    // intimate clarity
  xtal:      0.25,   // dreamy but clear
  syro:      0.5,    // complex textures need separation
  trance:    0.15,   // unison power is fine
  disco:     0.2,    // some separation
  ambient:   0.1,    // blending is the point,
  plantasia: 0.1,
};

/**
 * Strip octave number from a note string.
 * "C#3" → "C#", "Bb4" → "Bb", "C" → "C"
 */
function stripOctave(note: string): string {
  return note.replace(/\d+$/, '');
}
