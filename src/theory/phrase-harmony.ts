/**
 * Phrase-level harmonic structure — antecedent-consequent phrasing.
 *
 * Musical phrases naturally come in pairs:
 * - **Antecedent** ("question"): ends on a non-tonic chord (usually V or vi),
 *   creating an open, unresolved feeling
 * - **Consequent** ("answer"): ends on tonic (I), providing resolution
 *
 * This creates a sense of inevitability and purpose in chord progressions.
 * Instead of aimless wandering, the harmony has direction.
 *
 * The module tracks phrase position and biases chord selection
 * toward cadential targets at phrase boundaries.
 */

import type { Mood, Section } from '../types';

export type PhraseRole = 'antecedent' | 'consequent';

/**
 * Determine the current phrase role based on tick count.
 *
 * Phrases alternate: antecedent (question), then consequent (answer).
 * Phrase length varies by mood — slower moods have longer phrases.
 */
export function currentPhraseRole(tick: number, mood: Mood): PhraseRole {
  const len = phraseLength(mood);
  const phraseIndex = Math.floor(tick / len);
  return phraseIndex % 2 === 0 ? 'antecedent' : 'consequent';
}

/**
 * How many ticks constitute one phrase for a given mood.
 */
export function phraseLength(mood: Mood): number {
  const lengths: Record<Mood, number> = {
    ambient: 8,
    downtempo: 6,
    lofi: 6,
    trance: 4,
    avril: 8,
    xtal: 8,
    syro: 4,
    blockhead: 6,
    flim: 8,
    disco: 4,
  };
  return lengths[mood];
}

/**
 * Position within the current phrase (0.0 = start, 1.0 = end).
 */
export function phrasePosition(tick: number, mood: Mood): number {
  const len = phraseLength(mood);
  return (tick % len) / (len - 1 || 1);
}

/**
 * Whether we're near the end of the current phrase (cadence zone).
 * The cadence zone is the last ~25% of the phrase.
 */
export function isInCadenceZone(tick: number, mood: Mood): boolean {
  return phrasePosition(tick, mood) >= 0.75;
}

/**
 * Compute a bias weight array for chord degree selection that steers
 * toward appropriate cadential targets.
 *
 * At the end of an antecedent phrase, boost V (dominant) and vi.
 * At the end of a consequent phrase, boost I (tonic).
 * Away from phrase boundaries, return neutral weights.
 *
 * @param tick     Current tick
 * @param mood     Current mood
 * @param section  Current section
 * @returns Array of 7 multipliers for scale degrees 0-6
 */
export function phraseCadenceBias(
  tick: number,
  mood: Mood,
  section: Section
): number[] {
  const neutral = [1, 1, 1, 1, 1, 1, 1];
  const position = phrasePosition(tick, mood);
  const role = currentPhraseRole(tick, mood);

  // Only bias near phrase boundaries (last 25%)
  if (position < 0.75) return neutral;

  // Strength of bias increases as we approach the phrase end
  const strength = (position - 0.75) / 0.25; // 0→1 over last quarter
  const moodStrength = moodPhraseStrength(mood);
  const sectionMult = sectionPhraseMultiplier(section);
  const effectiveStrength = strength * moodStrength * sectionMult;

  if (effectiveStrength < 0.05) return neutral;

  const bias = [...neutral];

  if (role === 'antecedent') {
    // Question: steer toward half cadence (V) or deceptive (vi)
    bias[4] *= 1.0 + effectiveStrength * 1.5; // V (dominant)
    bias[5] *= 1.0 + effectiveStrength * 0.8; // vi (submediant)
    bias[3] *= 1.0 + effectiveStrength * 0.4; // IV (subdominant)
    // Discourage resolving to tonic in the question
    bias[0] *= 1.0 - effectiveStrength * 0.5;
  } else {
    // Answer: steer toward authentic cadence (I)
    bias[0] *= 1.0 + effectiveStrength * 2.0; // I (tonic — strong pull)
    bias[4] *= 1.0 + effectiveStrength * 0.6; // V (pre-resolution setup)
    // Discourage staying away from tonic in the answer
    bias[2] *= 1.0 - effectiveStrength * 0.3; // iii less likely
    bias[6] *= 1.0 - effectiveStrength * 0.4; // vii° less likely
  }

  return bias;
}

/**
 * Per-mood phrase structure strength.
 * Tonal moods benefit more from antecedent-consequent structure.
 * Ambient/drone moods are freer.
 */
function moodPhraseStrength(mood: Mood): number {
  const strengths: Record<Mood, number> = {
    trance: 0.9,
    disco: 0.85,
    blockhead: 0.7,
    downtempo: 0.65,
    lofi: 0.6,
    syro: 0.55,
    flim: 0.5,
    avril: 0.45,
    xtal: 0.3,
    ambient: 0.2,
  };
  return strengths[mood];
}

/**
 * Section multiplier for phrase structure.
 * Groove and build benefit most; breakdowns are freer.
 */
function sectionPhraseMultiplier(section: Section): number {
  const mults: Record<Section, number> = {
    groove: 1.2,
    build: 1.1,
    peak: 1.0,
    intro: 0.7,
    breakdown: 0.4,
  };
  return mults[section];
}

// Exported for testing
export { moodPhraseStrength, sectionPhraseMultiplier };
