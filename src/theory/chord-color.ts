/**
 * Chord color tones — characteristic added notes that give chords personality.
 *
 * Beyond basic chord tones, real musicians add "color" notes that
 * evoke specific moods:
 * - Major + #11 → lydian brightness (floating, dreamy)
 * - Minor + natural 6 → dorian warmth (soulful, jazzy)
 * - Dominant + #9 → Hendrix chord (bluesy, dirty)
 * - Minor + natural 9 → min9 lushness (neo-soul)
 *
 * Color tones are chosen based on mood and scale context, and
 * applied probabilistically so they feel like spontaneous choices
 * rather than systematic additions.
 */

import type { Mood, ChordQuality, NoteName } from '../types';
import { noteIndex, noteFromIndex } from './scales';

export interface ColorTone {
  interval: number;   // semitones above root
  name: string;       // description (for debugging)
  weight: number;     // relative probability (higher = more likely)
}

/**
 * Get available color tones for a chord quality.
 */
export function availableColorTones(quality: ChordQuality): ColorTone[] {
  return QUALITY_COLORS[quality] ?? [];
}

/**
 * Pick a color tone for the current context, or null if none should be added.
 *
 * @param root        Chord root note name
 * @param quality     Chord quality
 * @param scaleNotes  Current scale notes (for checking if color tone is diatonic)
 * @param mood        Current mood
 * @param octave      Octave to place the color tone in
 * @returns Note string (e.g., "F#4") or null
 */
export function pickColorTone(
  root: string,
  quality: ChordQuality,
  scaleNotes: string[],
  mood: Mood,
  octave: number
): string | null {
  const prob = colorToneProbability(mood);
  if (Math.random() >= prob) return null;

  const colors = availableColorTones(quality);
  if (colors.length === 0) return null;

  const rootIdx = noteIndex(root as NoteName);
  if (rootIdx === undefined) return null;

  // Filter to color tones that are diatonic (in the current scale)
  const scalePCs = new Set(scaleNotes.map(n => noteIndex(n as NoteName)));
  const diatonicColors = colors.filter(c => {
    const pc = (rootIdx + c.interval) % 12;
    return scalePCs.has(pc);
  });

  if (diatonicColors.length === 0) return null;

  // Weighted random selection
  const totalWeight = diatonicColors.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const color of diatonicColors) {
    r -= color.weight;
    if (r <= 0) {
      const pitch = (rootIdx + color.interval) % 12;
      const colorOctave = rootIdx + color.interval >= 12 ? octave + 1 : octave;
      return `${noteFromIndex(pitch)}${colorOctave}`;
    }
  }

  return null;
}

/**
 * Probability of adding a color tone for this mood.
 */
export function colorToneProbability(mood: Mood): number {
  return MOOD_COLOR_PROB[mood];
}

/**
 * Whether color tones should ever be considered for this mood.
 */
export function shouldConsiderColorTones(mood: Mood): boolean {
  return MOOD_COLOR_PROB[mood] > 0.01;
}

const MOOD_COLOR_PROB: Record<Mood, number> = {
  lofi:      0.30,   // jazzy — loves color tones
  downtempo: 0.25,   // soulful color
  blockhead: 0.20,   // hip-hop jazz
  flim:      0.20,   // delicate color
  avril:     0.15,   // intimate touches
  xtal:      0.15,   // dreamy color
  syro:      0.25,   // complex — welcomes color
  disco:     0.10,   // some funk color
  trance:    0.05,   // mostly clean chords
  ambient:   0.10,   // occasional shimmer,
  plantasia: 0.10,
};

/**
 * Color tones available for each chord quality.
 * Intervals in semitones from root.
 */
const QUALITY_COLORS: Partial<Record<ChordQuality, ColorTone[]>> = {
  maj: [
    { interval: 6,  name: '#11 (lydian)',    weight: 3 },  // lydian brightness
    { interval: 9,  name: '6th (added)',     weight: 2 },  // added 6th warmth
    { interval: 14, name: '9th',             weight: 2 },  // add9 lushness
  ],
  min: [
    { interval: 9,  name: 'natural 6 (dorian)', weight: 3 },  // dorian color
    { interval: 14, name: '9th',                 weight: 2 },  // min9 lushness
  ],
  maj7: [
    { interval: 6,  name: '#11 (lydian)',    weight: 3 },  // lydian maj7
    { interval: 14, name: '9th',             weight: 2 },  // maj9
  ],
  min7: [
    { interval: 9,  name: 'natural 6 (dorian)', weight: 3 },  // dorian m7
    { interval: 14, name: '9th',                 weight: 2 },  // m9
    { interval: 2,  name: '9th (voicing)',       weight: 1 },  // close-voiced 9
  ],
  dom7: [
    { interval: 15, name: '#9 (Hendrix)',    weight: 2 },  // Hendrix chord
    { interval: 14, name: '9th',             weight: 3 },  // 9th chord
    { interval: 6,  name: '#11 (lydian dom)', weight: 1 },  // lydian dominant
  ],
  sus2: [
    { interval: 9,  name: '6th',            weight: 2 },  // sus2 + 6
  ],
  sus4: [
    { interval: 14, name: '9th',            weight: 2 },  // sus4 + 9
  ],
};
