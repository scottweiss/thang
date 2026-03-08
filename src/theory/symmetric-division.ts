/**
 * Symmetric division of the octave — Coltrane-inspired key navigation.
 *
 * John Coltrane's "Giant Steps" (1960) divided the octave into three
 * equal parts (major thirds apart): C → E → Ab → C. This creates a
 * symmetrical key center cycle that sounds both inevitable and surprising.
 *
 * The principle generalizes:
 * - **Major thirds** (augmented triad): C → E → Ab (Coltrane changes)
 * - **Minor thirds** (diminished 7th): C → Eb → Gb → A (Bartók axis)
 * - **Tritone** (2 equal parts): C → F# (tritone substitution)
 * - **Whole tones** (6 equal parts): C → D → E → F# → Ab → Bb
 *
 * These symmetric divisions create key center movements that feel
 * both foreign and logical — the equal spacing gives a sense of
 * geometric inevitability.
 *
 * Application: during builds and key modulations, navigate between
 * key centers via symmetric axis points instead of circle-of-fifths.
 * This creates the "floating" harmonic quality of Coltrane's later work.
 */

import type { Mood, Section, NoteName } from '../types';

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};
const PC_TO_NOTE: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export type AxisType = 'major-third' | 'minor-third' | 'tritone' | 'whole-tone';

/** How much each mood uses symmetric navigation (0-1) */
const SYMMETRIC_TENDENCY: Record<Mood, number> = {
  syro:      0.25,  // IDM — geometric harmony
  lofi:      0.20,  // jazz — Coltrane influence
  xtal:      0.15,  // dreamy axis movement
  ambient:   0.12,  // floating key centers
  flim:      0.10,  // organic exploration
  downtempo: 0.08,  // subtle
  blockhead: 0.06,  // hip-hop — jazz influence
  avril:     0.04,  // songwriter — mostly diatonic
  disco:     0.03,  // functional
  trance:    0.02,  // very functional
};

/** Section multipliers */
const SECTION_SYMMETRIC_MULT: Record<Section, number> = {
  intro:     0.5,   // too early for exotic modulation
  build:     1.5,   // tension through key movement
  peak:      1.2,   // harmonic intensity
  breakdown: 1.8,   // floating key centers
  groove:    1.0,   // moderate
};

/**
 * Generate axis points — key centers that divide the octave equally.
 *
 * @param root      Starting root note
 * @param axisType  How to divide the octave
 * @returns Array of note names on the axis
 */
export function axisPoints(root: NoteName, axisType: AxisType): NoteName[] {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return [root];

  let interval: number;
  switch (axisType) {
    case 'major-third':  interval = 4; break;  // 3 points
    case 'minor-third':  interval = 3; break;  // 4 points
    case 'tritone':      interval = 6; break;  // 2 points
    case 'whole-tone':   interval = 2; break;  // 6 points
  }

  const points: NoteName[] = [];
  let pc = rootPC;
  do {
    points.push(PC_TO_NOTE[pc]);
    pc = (pc + interval) % 12;
  } while (pc !== rootPC);

  return points;
}

/**
 * Find the nearest axis point to a given note.
 * Used for smooth navigation toward symmetric key centers.
 *
 * @param current    Current root note
 * @param root       Axis root
 * @param axisType   Axis type
 * @returns Nearest axis point note
 */
export function nearestAxisPoint(
  current: NoteName,
  root: NoteName,
  axisType: AxisType
): NoteName {
  const currentPC = NOTE_TO_PC[current];
  if (currentPC === undefined) return current;

  const points = axisPoints(root, axisType);
  let nearestDist = 12;
  let nearest = points[0];

  for (const point of points) {
    const pointPC = NOTE_TO_PC[point]!;
    const dist = Math.min(
      (currentPC - pointPC + 12) % 12,
      (pointPC - currentPC + 12) % 12
    );
    if (dist < nearestDist && dist > 0) { // exclude current
      nearestDist = dist;
      nearest = point;
    }
  }

  return nearest;
}

/**
 * Suggest next key center via symmetric axis movement.
 * Picks the next point on the axis cycle from the current root.
 *
 * @param currentRoot  Current key center
 * @param axisType     Axis to follow
 * @param tick         For determinism
 * @returns Suggested new root
 */
export function suggestSymmetricMove(
  currentRoot: NoteName,
  axisType: AxisType,
  tick: number
): NoteName {
  const points = axisPoints(currentRoot, axisType);
  if (points.length <= 1) return currentRoot;

  // Usually move to the next axis point, occasionally jump further
  const hash = ((tick * 65537 + 37813) >>> 0) % (points.length - 1);
  // Skip the first point (which is current root)
  return points[(hash + 1) % points.length];
}

/**
 * Select axis type appropriate for the mood.
 * Jazz moods prefer major thirds (Coltrane), ambient prefers tritone.
 */
export function selectAxisType(mood: Mood, tick: number): AxisType {
  const weights: Record<Mood, Record<AxisType, number>> = {
    lofi:      { 'major-third': 4, 'minor-third': 2, 'tritone': 1, 'whole-tone': 1 },
    syro:      { 'major-third': 2, 'minor-third': 3, 'tritone': 2, 'whole-tone': 2 },
    xtal:      { 'major-third': 2, 'minor-third': 2, 'tritone': 3, 'whole-tone': 1 },
    ambient:   { 'major-third': 1, 'minor-third': 2, 'tritone': 3, 'whole-tone': 2 },
    flim:      { 'major-third': 2, 'minor-third': 2, 'tritone': 2, 'whole-tone': 1 },
    downtempo: { 'major-third': 3, 'minor-third': 2, 'tritone': 1, 'whole-tone': 1 },
    blockhead: { 'major-third': 3, 'minor-third': 2, 'tritone': 1, 'whole-tone': 0 },
    avril:     { 'major-third': 2, 'minor-third': 1, 'tritone': 1, 'whole-tone': 0 },
    disco:     { 'major-third': 2, 'minor-third': 1, 'tritone': 1, 'whole-tone': 0 },
    trance:    { 'major-third': 1, 'minor-third': 1, 'tritone': 1, 'whole-tone': 0 },
  };

  const w = weights[mood];
  const types: AxisType[] = ['major-third', 'minor-third', 'tritone', 'whole-tone'];
  const total = types.reduce((s, t) => s + w[t], 0);
  if (total === 0) return 'major-third';

  const hash = ((tick * 2654435761 + 41077) >>> 0) % total;
  let cum = 0;
  for (const t of types) {
    cum += w[t];
    if (hash < cum) return t;
  }
  return 'major-third';
}

/**
 * Whether to apply symmetric key navigation at this tick.
 */
export function shouldApplySymmetric(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = SYMMETRIC_TENDENCY[mood] * (SECTION_SYMMETRIC_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 43391) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get symmetric tendency for a mood (for testing).
 */
export function symmetricTendency(mood: Mood): number {
  return SYMMETRIC_TENDENCY[mood];
}
