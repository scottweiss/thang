/**
 * Accompaniment gravity — harmony and arp gravitate toward the next
 * chord before the melody arrives.
 *
 * In a great jazz trio, the pianist starts implying the next chord
 * a beat or two before the melody resolves there. The bass might
 * walk toward the new root. This creates a gravitational field that
 * pulls the listener forward.
 *
 * This is distinct from harmonic anticipation (melody previewing
 * next chord tones). Accompaniment gravity is about the BACKGROUND
 * voices creating harmonic context that the melody then lands into.
 *
 * The effect: chord changes feel inevitable rather than abrupt,
 * because the accompaniment was already pulling toward the new harmony.
 */

import type { Mood, Section } from '../types';

/** How strongly each mood's accompaniment gravitates forward (0-1) */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  lofi:      0.50,   // jazz — rhythm section leads the harmony
  downtempo: 0.40,   // smooth forward pull
  avril:     0.35,   // accompaniment supports the voice
  flim:      0.30,   // organic IDM
  ambient:   0.20,   // gentle drift,
  plantasia: 0.20,
  xtal:      0.25,   // dreamy pull
  blockhead: 0.25,   // hip-hop — bass leads
  syro:      0.20,   // structured but some pull
  disco:     0.30,   // bass walks ahead
  trance:    0.10,   // chords change on the beat, precisely
};

/** Section modifies gravity */
const SECTION_GRAVITY_MULT: Record<Section, number> = {
  intro:     0.5,    // establishing — stay grounded
  build:     1.3,    // maximum forward pull
  peak:      0.8,    // energy is now, not forward
  breakdown: 1.2,    // pulling toward resolution
  groove:    1.0,    // neutral
};

/**
 * How many ticks before a chord change the accompaniment should
 * start leaning toward the new harmony.
 */
const GRAVITY_WINDOW: Record<Mood, number> = {
  lofi:      2,
  downtempo: 2,
  avril:     1,
  flim:      1,
  ambient:   2,
  plantasia: 2,
  xtal:      2,
  blockhead: 1,
  syro:      1,
  disco:     1,
  trance:    1,
};

/**
 * Calculate how strongly the accompaniment should lean toward
 * the next chord at this moment.
 *
 * @param ticksSinceChordChange  How long the current chord has been playing
 * @param expectedChordDuration  How long chords typically last in this context
 * @param mood                   Current mood
 * @param section                Current section
 * @returns Gravity pull (0 = none, approaching 1 = full lean)
 */
export function accompGravityPull(
  ticksSinceChordChange: number,
  expectedChordDuration: number,
  mood: Mood,
  section: Section
): number {
  const window = GRAVITY_WINDOW[mood];
  const ticksUntilChange = expectedChordDuration - ticksSinceChordChange;

  // Only apply gravity when approaching a chord change
  if (ticksUntilChange > window || ticksUntilChange <= 0) return 0;

  const proximity = 1.0 - (ticksUntilChange / (window + 1));
  const strength = GRAVITY_STRENGTH[mood] * (SECTION_GRAVITY_MULT[section] ?? 1.0);

  return Math.min(1.0, proximity * strength);
}

/**
 * Given a gravity pull amount, determine what fraction of the
 * accompaniment's notes should come from the next chord vs current.
 *
 * @param pull  Gravity pull (0-1)
 * @returns Blend ratio (0 = all current chord, 1 = all next chord)
 */
export function nextChordBlend(pull: number): number {
  // Exponential curve: subtle at first, stronger near the change
  return pull * pull * 0.6; // Max 60% next-chord at full pull
}

/**
 * Select which notes from the next chord to blend into the current voicing.
 * Prefers notes that create smooth voice leading (minimal movement).
 *
 * @param currentNotes  Current chord voicing notes
 * @param nextNotes     Next chord's notes
 * @param blend         How much to blend (0-1)
 * @returns Array of notes mixing current and next
 */
export function blendVoicings(
  currentNotes: string[],
  nextNotes: string[],
  blend: number
): string[] {
  if (blend <= 0 || nextNotes.length === 0) return [...currentNotes];
  if (currentNotes.length === 0) return [...nextNotes];

  // How many notes to replace from current with next
  const replaceCount = Math.max(1, Math.round(currentNotes.length * blend));

  // Find next-chord notes with minimal movement from current positions
  const result = [...currentNotes];
  const nextPCs = nextNotes.map(n => n.replace(/[0-9]/g, ''));
  const currentPCs = currentNotes.map(n => n.replace(/[0-9]/g, ''));

  let replaced = 0;
  for (let i = result.length - 1; i >= 0 && replaced < replaceCount; i--) {
    const currentPC = currentPCs[i];
    // Only replace if this note isn't already in the next chord
    if (!nextPCs.includes(currentPC)) {
      // Find the nearest next-chord note to this position
      const currentOct = parseInt((result[i] || '').replace(/[^\d]/g, '') || '4');
      let bestNote = nextNotes[0];
      let bestDist = Infinity;
      for (const nn of nextNotes) {
        const nnPC = nn.replace(/[0-9]/g, '');
        const nnOct = parseInt(nn.replace(/[^\d]/g, '') || '4');
        const dist = Math.abs(nnOct - currentOct) * 12; // rough distance
        if (dist < bestDist && !result.slice(0, i).some(r => r.replace(/[0-9]/g, '') === nnPC)) {
          bestDist = dist;
          bestNote = nn;
        }
      }
      result[i] = bestNote;
      replaced++;
    }
  }

  return result;
}

/**
 * Whether accompaniment gravity should be active.
 */
export function shouldApplyAccompGravity(mood: Mood): boolean {
  return GRAVITY_STRENGTH[mood] >= 0.10;
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function accompGravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
