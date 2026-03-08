/**
 * Heterophony — multiple voices playing variants of the same melody.
 *
 * One of the oldest and most universal musical textures:
 * - Byzantine chant: parallel voices with slight ornamental variation
 * - Gamelan: instruments playing the same melody at different speeds
 * - Middle Eastern music: oud and voice in heterophonic unison
 * - Modern ambient: layered voices with micro-pitch/timing differences
 *
 * Unlike counterpoint (independent melodies) or homophony (melody + chords),
 * heterophony is melody + melody-variant. The slight differences create
 * a shimmering, alive quality that pure unison cannot achieve.
 *
 * Application: when triggered, the arp layer receives a displaced/
 * ornamented version of the melody's current motif, creating a
 * heterophonic texture instead of independent arp patterns.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses heterophony (0-1) */
const HETEROPHONY_TENDENCY: Record<Mood, number> = {
  xtal:      0.40,  // crystalline shimmer
  ambient:   0.35,  // layered textures
  flim:      0.25,  // organic doubling
  avril:     0.20,  // singer-songwriter unison
  downtempo: 0.18,  // warm doubling
  lofi:      0.15,  // subtle
  syro:      0.12,  // occasional
  blockhead: 0.08,  // hip-hop — rare
  disco:     0.05,  // independent parts preferred
  trance:    0.03,  // arp too different from melody
};

/** Section multiplier */
const SECTION_HETERO_MULT: Record<Section, number> = {
  intro:     1.5,   // unison openings are powerful
  build:     0.8,   // separating into independent parts
  peak:      0.5,   // maximum independence
  breakdown: 1.8,   // heterophonic texture at its most expressive
  groove:    1.0,   // neutral
};

export type HeterophonyVariation = 'rhythmic' | 'ornamental' | 'octave' | 'shadow';

/**
 * Determine whether heterophony should be applied.
 */
export function shouldApplyHeterophony(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = HETEROPHONY_TENDENCY[mood] * (SECTION_HETERO_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 8191) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Select the type of heterophonic variation to apply.
 *
 * - rhythmic: same pitches, displaced in time (rests inserted/removed)
 * - ornamental: neighbor tones added around melody pitches
 * - octave: same melody, transposed up/down an octave
 * - shadow: melody notes delayed by 1-2 positions (canon-like)
 */
export function selectVariation(
  mood: Mood,
  section: Section,
  tick: number
): HeterophonyVariation {
  const variations: HeterophonyVariation[] = ['rhythmic', 'ornamental', 'octave', 'shadow'];
  // Mood biases certain variations
  const weights: Record<Mood, number[]> = {
    ambient:   [1, 2, 3, 2],  // prefers octave doubling
    xtal:      [1, 3, 2, 2],  // prefers ornamental
    flim:      [2, 2, 1, 3],  // prefers shadow
    downtempo: [2, 1, 2, 3],  // prefers shadow
    lofi:      [3, 2, 1, 2],  // prefers rhythmic
    avril:     [1, 1, 4, 2],  // prefers octave
    syro:      [3, 2, 1, 2],  // prefers rhythmic
    blockhead: [3, 1, 2, 2],  // prefers rhythmic
    disco:     [2, 1, 3, 2],  // prefers octave
    trance:    [1, 1, 4, 2],  // prefers octave
  };

  const w = weights[mood];
  const total = w.reduce((a, b) => a + b, 0);
  const hash = ((tick * 65537 + 3571) >>> 0) % total;
  let cumulative = 0;
  for (let i = 0; i < variations.length; i++) {
    cumulative += w[i];
    if (hash < cumulative) return variations[i];
  }
  return 'shadow';
}

/**
 * Create a rhythmic variant of a melody — insert/remove rests.
 */
export function rhythmicVariant(melody: string[]): string[] {
  return melody.map((note, i) => {
    if (note === '~') return note;
    // Offset some notes by turning them into rests and vice versa
    if (i % 3 === 1) return '~';  // thin out every 3rd position
    return note;
  });
}

/**
 * Create an ornamental variant — add neighbor tones.
 *
 * @param melody      Original melody notes
 * @param scaleNotes  Available scale notes (pitch classes)
 */
export function ornamentalVariant(melody: string[], scaleNotes: string[]): string[] {
  if (scaleNotes.length === 0) return [...melody];

  return melody.map((note, i) => {
    if (note === '~') return note;
    // Every other note, replace with a neighbor tone
    if (i % 2 === 1) {
      const pc = note.replace(/\d+$/, '');
      const oct = note.match(/\d+$/)?.[0] ?? '4';
      const idx = scaleNotes.indexOf(pc);
      if (idx >= 0) {
        // Upper neighbor
        const neighbor = scaleNotes[(idx + 1) % scaleNotes.length];
        return `${neighbor}${oct}`;
      }
    }
    return note;
  });
}

/**
 * Create an octave variant — transpose up or down an octave.
 *
 * @param melody    Original notes
 * @param direction 1 = up, -1 = down
 */
export function octaveVariant(melody: string[], direction: 1 | -1 = 1): string[] {
  return melody.map(note => {
    if (note === '~') return note;
    const match = note.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!match) return note;
    const newOct = Math.max(2, Math.min(6, parseInt(match[2]) + direction));
    return `${match[1]}${newOct}`;
  });
}

/**
 * Create a shadow variant — delay the melody by shifting positions.
 *
 * @param melody  Original notes
 * @param delay   Number of positions to shift (1-3)
 */
export function shadowVariant(melody: string[], delay: number = 1): string[] {
  const result = new Array(melody.length).fill('~');
  for (let i = 0; i < melody.length - delay; i++) {
    result[i + delay] = melody[i];
  }
  return result;
}

/**
 * Get heterophony tendency for a mood (for testing).
 */
export function heterophonyTendency(mood: Mood): number {
  return HETEROPHONY_TENDENCY[mood];
}
