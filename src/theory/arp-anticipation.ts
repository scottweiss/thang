/**
 * Arp harmonic anticipation — blend next-chord tones before the change.
 *
 * When a chord change is imminent, the arp starts introducing tones from
 * the upcoming chord into its note pool. This creates a smooth harmonic
 * transition where the arp "leads" the listener into the new harmony,
 * rather than abruptly switching all notes at once.
 *
 * The effect is progressive: the closer to the change, the more
 * next-chord tones appear. This mirrors how skilled jazz musicians
 * anticipate chord changes by playing "toward" the next chord.
 */

import type { Mood } from '../types';

/** Per-mood anticipation tendency */
const ANTICIPATION_STRENGTH: Record<Mood, number> = {
  lofi:      0.50,   // jazz — strong anticipation
  downtempo: 0.40,   // smooth — noticeable anticipation
  blockhead: 0.35,   // hip-hop — moderate
  disco:     0.30,   // funk — some anticipation
  flim:      0.30,   // delicate — some
  syro:      0.25,   // IDM — some anticipation
  xtal:      0.20,   // dreamy — gentle
  avril:     0.20,   // intimate — gentle
  trance:    0.10,   // driving — minimal (clean changes preferred)
  ambient:   0.05,   // static — almost none,
  plantasia: 0.05,
};

/**
 * Whether the arp should anticipate the next chord.
 *
 * @param mood                Current mood
 * @param ticksSinceChange    Ticks since last chord change
 * @param hasNextHint         Whether next chord hint is available
 */
export function shouldArpAnticipate(
  mood: Mood,
  ticksSinceChange: number,
  hasNextHint: boolean
): boolean {
  if (!hasNextHint) return false;
  // Only anticipate after we've been on the current chord for a while
  if (ticksSinceChange < 3) return false;
  return Math.random() < ANTICIPATION_STRENGTH[mood];
}

/**
 * Blend notes from the next chord into the current arp note pool.
 *
 * @param currentNotes   Current chord notes (with octaves)
 * @param nextNotes      Next chord notes (with octaves, or just names)
 * @param mood           Current mood (controls blend amount)
 * @returns Enriched note pool with some next-chord tones appended
 */
export function blendNextChordTones(
  currentNotes: string[],
  nextNotes: string[],
  mood: Mood
): string[] {
  if (nextNotes.length === 0) return currentNotes;

  const strength = ANTICIPATION_STRENGTH[mood];
  // Add 1-2 notes from the next chord based on strength
  const count = strength > 0.3 ? 2 : 1;

  // Pick notes from the next chord that aren't already in the current chord
  const currentNames = new Set(currentNotes.map(n => n.replace(/\d+$/, '')));
  const novel = nextNotes.filter(n => !currentNames.has(n.replace(/\d+$/, '')));

  if (novel.length === 0) return currentNotes; // same chord tones — nothing to add

  // Take up to `count` novel tones
  const toAdd = novel.slice(0, count);

  // Ensure they have octave numbers (if they're just note names, add octave 4)
  const withOctave = toAdd.map(n => /\d$/.test(n) ? n : `${n}4`);

  return [...currentNotes, ...withOctave];
}

/**
 * Get the anticipation strength for a mood (for testing).
 */
export function arpAnticipationStrength(mood: Mood): number {
  return ANTICIPATION_STRENGTH[mood];
}
