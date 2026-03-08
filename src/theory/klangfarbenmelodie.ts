/**
 * Klangfarbenmelodie — "tone-color melody" (Schoenberg/Webern).
 *
 * Instead of one instrument playing a continuous melody, individual
 * notes are distributed across different timbres. Each note gets a
 * different "color", creating a pointillistic texture where the melody
 * emerges from the collective rather than a single voice.
 *
 * In our context, this means occasionally changing the oscillator type,
 * FM ratio, or filter character on a per-note basis within a single
 * layer's pattern. The melody "shimmers" between timbres.
 *
 * Applied subtly: most notes keep the layer's default timbre, but
 * certain notes (typically on weak beats or passing tones) shift to
 * a contrasting color. This creates sparkle without losing coherence.
 *
 * Best suited for: ambient, xtal, flim, syro (pointillistic moods).
 * Avoided in: trance, disco (need consistent timbre for drive).
 */

import type { Mood, Section } from '../types';

export type TimbralSlot = 'default' | 'bright' | 'dark' | 'hollow';

/** Per-note timbral character */
export interface NoteTimbre {
  slot: TimbralSlot;
  /** FM depth multiplier relative to layer default */
  fmMult: number;
  /** Filter brightness multiplier */
  lpfMult: number;
  /** Attack time multiplier (shorter = pluckier) */
  attackMult: number;
}

const SLOT_PROFILES: Record<TimbralSlot, NoteTimbre> = {
  default: { slot: 'default', fmMult: 1.0, lpfMult: 1.0, attackMult: 1.0 },
  bright:  { slot: 'bright',  fmMult: 1.4, lpfMult: 1.5, attackMult: 0.7 },
  dark:    { slot: 'dark',    fmMult: 0.5, lpfMult: 0.6, attackMult: 1.3 },
  hollow:  { slot: 'hollow',  fmMult: 0.2, lpfMult: 0.8, attackMult: 0.5 },
};

/** How much each mood uses Klangfarbenmelodie (0-1) */
const KFM_TENDENCY: Record<Mood, number> = {
  xtal:      0.45,  // crystalline pointillism
  ambient:   0.40,  // shimmering tones
  flim:      0.35,  // organic variety
  syro:      0.30,  // IDM timbral play
  avril:     0.15,  // occasional color
  lofi:      0.12,  // subtle warmth shifts
  downtempo: 0.10,  // minimal
  blockhead: 0.08,  // hip-hop — consistent tone preferred
  disco:     0.03,  // uniform drive
  trance:    0.02,  // almost never
};

/** Section multiplier */
const SECTION_KFM_MULT: Record<Section, number> = {
  intro:     1.3,   // colorful opening
  build:     0.6,   // reduce — focus on momentum
  peak:      0.4,   // minimal — energy
  breakdown: 1.8,   // maximum pointillism
  groove:    1.0,   // neutral
};

/**
 * Generate a per-note timbral color map for a phrase.
 * Returns an array of TimbralSlots, one per note position.
 *
 * @param noteCount  Number of notes in the phrase
 * @param mood       Current mood
 * @param section    Current section
 * @param tick       Current tick (for determinism)
 * @returns Array of timbral slots for each note position
 */
export function generateTimbreMap(
  noteCount: number,
  mood: Mood,
  section: Section,
  tick: number
): TimbralSlot[] {
  const tendency = KFM_TENDENCY[mood] * (SECTION_KFM_MULT[section] ?? 1.0);
  const slots: TimbralSlot[] = [];
  const alternatives: TimbralSlot[] = ['bright', 'dark', 'hollow'];

  for (let i = 0; i < noteCount; i++) {
    // Deterministic per-note hash
    const hash = (((tick * 65537 + i * 2654435761 + 31) >>> 0) / 4294967296);
    if (hash < tendency) {
      // Select alternative timbre based on position
      const altIdx = ((tick + i * 7) >>> 0) % alternatives.length;
      slots.push(alternatives[altIdx]);
    } else {
      slots.push('default');
    }
  }

  return slots;
}

/**
 * Get the timbral profile for a slot.
 */
export function slotProfile(slot: TimbralSlot): NoteTimbre {
  return { ...SLOT_PROFILES[slot] };
}

/**
 * Whether Klangfarbenmelodie should be active for this context.
 */
export function shouldApplyKFM(mood: Mood, section: Section): boolean {
  const tendency = KFM_TENDENCY[mood] * (SECTION_KFM_MULT[section] ?? 1.0);
  return tendency >= 0.08;
}

/**
 * Get KFM tendency for a mood (for testing).
 */
export function kfmTendency(mood: Mood): number {
  return KFM_TENDENCY[mood];
}

/**
 * Apply timbral variation to a Strudel FM depth value.
 * Returns modified .fm() value based on the note's timbral slot.
 */
export function applyTimbreToFM(baseFM: number, slot: TimbralSlot): number {
  return baseFM * SLOT_PROFILES[slot].fmMult;
}

/**
 * Apply timbral variation to a Strudel LPF value.
 */
export function applyTimbreToLPF(baseLPF: number, slot: TimbralSlot): number {
  return baseLPF * SLOT_PROFILES[slot].lpfMult;
}
