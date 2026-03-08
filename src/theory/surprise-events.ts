/**
 * Surprise events — rare, joyful moments that break expectations.
 *
 * Great generative music needs surprises: a sudden high bell tone,
 * a brief rhythmic hiccup, an unexpected octave leap, a moment of
 * unison between layers. These are the "oh!" moments that make
 * listeners smile.
 *
 * Surprises must be:
 * - Rare (2-5% probability per tick)
 * - Brief (1-2 ticks)
 * - Musical (not random noise)
 * - Context-appropriate (different surprises per mood)
 *
 * Types:
 * - Octave leap: melody jumps up an octave for one note
 * - Register shift: arp briefly plays in an unusually high/low register
 * - Unison moment: arp mirrors melody's current note (layers converge)
 * - Rhythmic break: brief silence before a strong beat (micro-rest)
 * - Brightness flash: LPF opens wide for one beat then closes
 */

import type { Mood, Section } from '../types';

export type SurpriseType =
  | 'octave-leap'
  | 'register-shift'
  | 'unison'
  | 'brightness-flash'
  | 'none';

/**
 * Should a surprise event happen this tick?
 * Returns the type of surprise, or 'none'.
 */
export function rollSurprise(
  mood: Mood,
  section: Section,
  ticksSinceLastSurprise: number
): SurpriseType {
  // Minimum cooldown: no surprises within 8 ticks of each other
  if (ticksSinceLastSurprise < 8) return 'none';

  const prob = surpriseProbability(mood, section);
  if (Math.random() >= prob) return 'none';

  // Pick a surprise type based on mood
  const types = MOOD_SURPRISE_TYPES[mood];
  if (!types || types.length === 0) return 'none';

  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Probability of a surprise per tick.
 */
export function surpriseProbability(mood: Mood, section: Section): number {
  const base = MOOD_SURPRISE_RATE[mood];
  const mult = SECTION_SURPRISE_MULT[section];
  return base * mult;
}

/**
 * Apply an octave-leap surprise to a melody note pattern.
 * Shifts the highest note up an octave.
 */
export function applyOctaveLeap(noteStr: string): string {
  const notes = noteStr.split(' ');
  if (notes.length === 0) return noteStr;

  // Find a non-rest note near the middle-end of the pattern
  const candidates = notes
    .map((n, i) => ({ note: n, idx: i }))
    .filter(({ note, idx }) => note !== '~' && idx > notes.length * 0.4);

  if (candidates.length === 0) return noteStr;

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const match = target.note.match(/^([A-G][b#]?)(\d)$/);
  if (!match) return noteStr;

  const octave = parseInt(match[2]);
  if (octave >= 6) return noteStr; // already high enough

  notes[target.idx] = `${match[1]}${octave + 1}`;
  return notes.join(' ');
}

/**
 * Apply a register-shift surprise to arp notes.
 * Shifts all notes up or down an octave for one pattern cycle.
 */
export function applyRegisterShift(noteStr: string, direction: 'up' | 'down'): string {
  return noteStr.replace(/([A-G][b#]?)(\d)/g, (_match, name, oct) => {
    const o = parseInt(oct);
    const shifted = direction === 'up' ? Math.min(6, o + 1) : Math.max(2, o - 1);
    return `${name}${shifted}`;
  });
}

/**
 * Apply a brightness-flash surprise.
 * Returns a multiplier for LPF that opens the filter briefly.
 */
export function brightnessFlashMultiplier(): number {
  return 1.5; // 50% brighter
}

/** Per-mood surprise rate (probability per tick) */
const MOOD_SURPRISE_RATE: Record<Mood, number> = {
  flim:      0.05,   // IDM loves surprises
  syro:      0.05,   // complex and playful
  xtal:      0.04,   // dreamy unexpected moments
  lofi:      0.03,   // occasional charm
  blockhead: 0.03,   // hip-hop surprises
  downtempo: 0.025,  // gentle surprises
  avril:     0.02,   // intimate moments
  disco:     0.02,   // funky surprises
  ambient:   0.01,   // very rare — space is sacred
  trance:    0.01,   // mostly predictable by design
};

/** Section multiplier for surprise rate */
const SECTION_SURPRISE_MULT: Record<Section, number> = {
  intro:     0.3,    // establishing — few surprises
  build:     0.8,    // some surprises during build
  peak:      0.5,    // busy — surprises get lost
  breakdown: 1.5,    // space for surprises to land
  groove:    1.2,    // settled — surprises delight
};

/** Per-mood available surprise types */
const MOOD_SURPRISE_TYPES: Record<Mood, SurpriseType[]> = {
  flim:      ['octave-leap', 'register-shift', 'brightness-flash'],
  syro:      ['octave-leap', 'register-shift', 'brightness-flash'],
  xtal:      ['octave-leap', 'brightness-flash'],
  lofi:      ['octave-leap', 'unison'],
  blockhead: ['octave-leap', 'register-shift'],
  downtempo: ['octave-leap', 'brightness-flash'],
  avril:     ['octave-leap', 'brightness-flash'],
  disco:     ['register-shift', 'brightness-flash'],
  ambient:   ['brightness-flash'],
  trance:    ['brightness-flash'],
};
