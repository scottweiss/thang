/**
 * Voice exchange — melodic voices swap notes for rich counterpoint.
 *
 * In traditional counterpoint, voice exchange occurs when two voices
 * trade their pitch material: if voice 1 plays C-E and voice 2 plays
 * E-C, they've "exchanged" voices. This creates beautiful contrary
 * motion while maintaining harmonic stability.
 *
 * In our system, this manifests as:
 * - Arp occasionally borrows specific melody notes
 * - Melody occasionally takes arp's characteristic pitches
 * - The exchange creates a sense of conversation and unity
 *
 * This is distinct from call-and-response (timing-based) and
 * register-complement (octave-based). Voice exchange is about
 * specific pitch material being shared.
 */

import type { Mood, Section } from '../types';

/** How strongly each mood uses voice exchange (0-1) */
const EXCHANGE_STRENGTH: Record<Mood, number> = {
  lofi:      0.45,   // jazz — voices converse intimately
  flim:      0.40,   // organic IDM — interlocking melodies
  avril:     0.35,   // singer-songwriter — verse/chorus interplay
  downtempo: 0.30,   // moderate exchange
  xtal:      0.30,   // dreamy interlocking
  ambient:   0.20,   // subtle exchange
  blockhead: 0.25,   // hip-hop — sample-layer interplay
  syro:      0.35,   // IDM — complex voice relationships
  disco:     0.15,   // groove — voices stay in lanes
  trance:    0.10,   // minimal exchange — layers are distinct
};

/** Section modifies exchange probability */
const SECTION_EXCHANGE_MULT: Record<Section, number> = {
  intro:     0.5,    // establishing — keep voices separate
  build:     1.0,    // moderate interplay
  peak:      1.3,    // maximum interaction
  breakdown: 0.7,    // voices separate for clarity
  groove:    1.2,    // conversational
};

/**
 * Determine if voice exchange should occur this tick.
 *
 * @param tick     Current tick
 * @param mood     Current mood
 * @param section  Current section
 */
export function shouldExchangeVoices(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const strength = EXCHANGE_STRENGTH[mood] * (SECTION_EXCHANGE_MULT[section] ?? 1.0);
  // Deterministic: exchange on specific tick patterns
  const hash = ((tick * 2654435761 + 7) >>> 0) / 4294967296;
  return hash < strength * 0.3; // Max ~15% of ticks to keep it subtle
}

/**
 * Select notes from a source voice to inject into a target voice.
 * Picks notes that are harmonically compatible (within the chord)
 * but occupy a different register than the target's current material.
 *
 * @param sourceNotes  Notes from the source voice (e.g., melody motif)
 * @param targetNotes  Current notes of the target voice (e.g., arp pattern)
 * @param chordNotes   Current chord notes for compatibility check
 * @param maxExchange  Maximum number of notes to exchange (1-2)
 * @returns Notes from source that should be injected into target
 */
export function selectExchangeNotes(
  sourceNotes: string[],
  targetNotes: string[],
  chordNotes: string[],
  maxExchange: number = 1
): string[] {
  // Strip octaves for pitch class comparison
  const chordPCs = new Set(chordNotes.map(n => n.replace(/[0-9]/g, '')));
  const targetPCs = new Set(targetNotes.filter(n => n !== '~').map(n => n.replace(/[0-9]/g, '')));

  // Find source notes that are chord tones but not in the target's current set
  const candidates = sourceNotes
    .filter(n => n !== '~')
    .filter(n => {
      const pc = n.replace(/[0-9]/g, '');
      return chordPCs.has(pc) && !targetPCs.has(pc);
    });

  // Return up to maxExchange unique pitch classes
  const seen = new Set<string>();
  const result: string[] = [];
  for (const n of candidates) {
    const pc = n.replace(/[0-9]/g, '');
    if (!seen.has(pc) && result.length < maxExchange) {
      seen.add(pc);
      result.push(n);
    }
  }

  return result;
}

/**
 * Get the exchange strength for a mood (for testing).
 */
export function exchangeStrength(mood: Mood): number {
  return EXCHANGE_STRENGTH[mood];
}
