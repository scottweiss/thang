/**
 * Progression loop — curated repeating chord progressions that encode genre DNA.
 *
 * Each mood has weighted templates reflecting its harmonic identity:
 * - lofi: jazz turnarounds (ii-V-I), extended chords
 * - trance: anthemic minor progressions with strong V-I motion
 * - ambient: gentle plagal motion, suspended chords, modal drift
 * - syro: disorienting sequences, diminished chords, ascending thirds
 *
 * Loops are 4 chords long and repeat for the duration of a section.
 * Section derivation transforms the home loop:
 * - intro: single tonic chord, doubled duration
 * - build: rotated loop for forward motion
 * - peak: cadential V-I ending for resolution
 * - breakdown: 2-chord oscillation, doubled duration
 * - groove: home loop unchanged
 */

import type { Mood, Section, ChordQuality, ProgressionLoop } from '../types';

/** Template definition with degrees, qualities, and selection weight */
interface LoopTemplate {
  degrees: number[];
  qualities: ChordQuality[];
  weight: number;
}

/** Curated loop templates per mood — these encode genre DNA */
const LOOP_TEMPLATES: Record<Mood, LoopTemplate[]> = {
  lofi: [
    { degrees: [1, 4, 0, 5], qualities: ['min7', 'dom7', 'maj7', 'min7'], weight: 3 },  // ii7-V7-Imaj7-vi7 (jazz)
    { degrees: [0, 5, 3, 4], qualities: ['maj7', 'min7', 'maj7', 'dom7'], weight: 2 },  // I7-vi7-IV7-V7
    { degrees: [1, 4, 0, 0], qualities: ['min7', 'dom7', 'maj7', 'maj7'], weight: 2 },  // ii7-V7-I7-I7 turnaround
  ],
  ambient: [
    { degrees: [0, 3, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 3 },      // I-IV-vi-IV (gentle)
    { degrees: [0, 5, 0, 5], qualities: ['sus2', 'min', 'sus2', 'min'], weight: 2 },    // Isus-vi oscillation
    { degrees: [0, 2, 3, 1], qualities: ['sus4', 'min', 'maj', 'min'], weight: 2 },     // modal drift
  ],
  plantasia: [
    { degrees: [0, 4, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 3 },      // I-V-vi-IV (classic Moog pop)
    { degrees: [0, 3, 4, 0], qualities: ['maj', 'maj', 'maj', 'maj'], weight: 2 },      // I-IV-V-I (plain cadential)
    { degrees: [0, 2, 3, 4], qualities: ['add9', 'min', 'maj', 'maj'], weight: 2 },     // Iadd9-iii-IV-V
    { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'add9', 'maj'], weight: 2 },     // I-vi-IVadd9-V
  ],
  trance: [
    { degrees: [0, 4, 5, 3], qualities: ['min', 'maj', 'maj', 'maj'], weight: 3 },      // i-V-VI-IV (anthemic minor)
    { degrees: [5, 3, 0, 4], qualities: ['maj', 'maj', 'min', 'maj'], weight: 2 },       // VI-IV-i-V
    { degrees: [0, 3, 4, 0], qualities: ['min', 'maj', 'maj', 'min'], weight: 2 },       // i-IV-V-i
  ],
  downtempo: [
    { degrees: [0, 4, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 3 },      // I-V-vi-IV
    { degrees: [1, 4, 0, 5], qualities: ['min', 'dom7', 'maj', 'min'], weight: 2 },     // ii-V-I-vi
    { degrees: [0, 3, 1, 4], qualities: ['maj', 'maj', 'min', 'maj'], weight: 2 },      // I-IV-ii-V
  ],
  avril: [
    { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'], weight: 3 },      // I-vi-IV-V
    { degrees: [0, 3, 0, 4], qualities: ['maj', 'maj', 'maj', 'sus4'], weight: 2 },     // I-IV-I-Vsus
    { degrees: [0, 2, 3, 0], qualities: ['maj', 'min', 'maj', 'maj'], weight: 2 },      // I-iii-IV-I
  ],
  xtal: [
    { degrees: [0, 5, 3, 2], qualities: ['maj', 'min', 'maj', 'min'], weight: 3 },      // I-vi-IV-iii
    { degrees: [0, 3, 5, 0], qualities: ['sus2', 'maj', 'min', 'sus2'], weight: 2 },    // Isus-IV-vi-Isus
    { degrees: [5, 3, 0, 4], qualities: ['min', 'maj', 'maj', 'maj'], weight: 2 },      // vi-IV-I-V
  ],
  syro: [
    { degrees: [0, 6, 3, 1], qualities: ['min', 'dim', 'maj', 'min'], weight: 3 },      // i-vii°-IV-ii (disorienting)
    { degrees: [4, 0, 5, 3], qualities: ['dom7', 'min', 'maj', 'maj'], weight: 2 },     // V7-i-VI-IV
    { degrees: [0, 2, 4, 6], qualities: ['min', 'min', 'maj', 'dim'], weight: 2 },      // ascending thirds
  ],
  blockhead: [
    { degrees: [0, 3, 4, 3], qualities: ['min', 'dom7', 'maj', 'dom7'], weight: 3 },    // i-IV7-V-IV7 (funky)
    { degrees: [0, 5, 1, 4], qualities: ['min', 'maj', 'min', 'maj'], weight: 2 },      // i-VI-ii-V
  ],
  flim: [
    { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'], weight: 3 },      // I-vi-IV-V
    { degrees: [0, 2, 3, 0], qualities: ['maj', 'min', 'maj', 'maj'], weight: 2 },      // I-iii-IV-I
    { degrees: [0, 3, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 2 },      // I-IV-vi-IV
  ],
  disco: [
    { degrees: [0, 4, 5, 3], qualities: ['maj', 'dom7', 'min', 'maj'], weight: 3 },     // I-V7-vi-IV (pop anthem)
    { degrees: [5, 3, 0, 4], qualities: ['min', 'maj', 'maj', 'dom7'], weight: 2 },     // vi-IV-I-V7
    { degrees: [0, 3, 0, 4], qualities: ['maj', 'maj', 'maj', 'dom7'], weight: 2 },     // I-IV-I-V7
  ],
};

/** Default bars per chord for each mood */
const BARS_PER_CHORD: Record<Mood, number> = {
  ambient: 4,
  plantasia: 4,
  downtempo: 2,
  lofi: 2,
  trance: 2,
  avril: 4,
  xtal: 2,
  syro: 1,
  blockhead: 2,
  flim: 2,
  disco: 2,
};

/**
 * Pick a weighted random template from the list.
 * Returns a copy so callers can mutate freely.
 */
function weightedPick(templates: LoopTemplate[]): LoopTemplate {
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of templates) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return templates[templates.length - 1];
}

/**
 * Check whether a template can be used with the available degrees.
 */
function templateFitsAvailable(template: LoopTemplate, available: number[]): boolean {
  return template.degrees.every(d => available.includes(d));
}

/**
 * Remap a template's degrees to fit available degrees by substituting
 * unavailable degrees with the nearest available one.
 */
function remapTemplate(template: LoopTemplate, available: number[]): LoopTemplate {
  const degrees = template.degrees.map(d => {
    if (available.includes(d)) return d;
    // Find nearest available degree
    let best = available[0];
    let bestDist = Math.abs(d - best);
    for (const a of available) {
      const dist = Math.abs(d - a);
      if (dist < bestDist) {
        bestDist = dist;
        best = a;
      }
    }
    return best;
  });
  return { degrees, qualities: [...template.qualities], weight: template.weight };
}

/**
 * Generate a progression loop for a given mood.
 *
 * Picks from curated templates weighted by genre relevance.
 * Templates are filtered/remapped to only use available degrees.
 *
 * @param mood  Current mood
 * @param availableDegrees  Scale degrees available (0-6)
 * @returns A ProgressionLoop with 4 chords
 */
export function generateLoop(mood: Mood, availableDegrees: number[]): ProgressionLoop {
  const templates = LOOP_TEMPLATES[mood];

  // Try to find templates that fit the available degrees exactly
  const fitting = templates.filter(t => templateFitsAvailable(t, availableDegrees));

  let chosen: LoopTemplate;
  if (fitting.length > 0) {
    chosen = weightedPick(fitting);
  } else {
    // Remap the best-weighted template to fit available degrees
    chosen = remapTemplate(weightedPick(templates), availableDegrees);
  }

  return {
    degrees: [...chosen.degrees],
    qualities: [...chosen.qualities],
    barsPerChord: BARS_PER_CHORD[mood],
    loopCount: -1,
  };
}

/**
 * Find the chord in the home loop most distant from the tonic (degree 0).
 * Distance is measured as scale-degree distance.
 */
function mostDistantDegree(home: ProgressionLoop): number {
  const tonic = home.degrees[0];
  let best = home.degrees[0];
  let bestDist = 0;
  for (const d of home.degrees) {
    const dist = Math.abs(d - tonic);
    // Prefer degrees further from tonic, break ties by picking higher degree
    if (dist > bestDist || (dist === bestDist && d > best)) {
      bestDist = dist;
      best = d;
    }
  }
  // If all degrees are the same as tonic, fall back to degree 3 (IV) or 4 (V)
  if (best === tonic && home.degrees.length > 1) {
    for (const d of home.degrees) {
      if (d !== tonic) return d;
    }
  }
  return best;
}

/**
 * Derive a section-specific loop from the home progression.
 *
 * - intro: single tonic chord, doubled barsPerChord
 * - build: rotate home loop by 1-2 positions
 * - peak: ensure V-I cadential ending
 * - breakdown: 2-chord subset (tonic + most distant), doubled barsPerChord
 * - groove: home loop unchanged
 *
 * @param home     The home progression loop
 * @param section  Target section
 * @param mood     Current mood (for barsPerChord defaults)
 * @returns Derived ProgressionLoop
 */
export function deriveLoopForSection(
  home: ProgressionLoop,
  section: Section,
  _mood: Mood,
): ProgressionLoop {
  switch (section) {
    case 'intro': {
      const tonicDeg = home.degrees[0];
      const tonicQuality = home.qualities[0];
      return {
        degrees: [tonicDeg],
        qualities: [tonicQuality],
        barsPerChord: home.barsPerChord * 2,
        loopCount: -1,
      };
    }

    case 'build': {
      // Rotate by 1 or 2 positions
      const rotation = 1 + Math.floor(Math.random() * 2); // 1 or 2
      const len = home.degrees.length;
      const degrees = home.degrees.map((_, i) => home.degrees[(i + rotation) % len]);
      const qualities = home.qualities.map((_, i) => home.qualities[(i + rotation) % len]);
      return {
        degrees,
        qualities,
        barsPerChord: home.barsPerChord,
        loopCount: -1,
      };
    }

    case 'peak': {
      // Copy home and ensure V-I cadential ending
      const degrees = [...home.degrees];
      const qualities = [...home.qualities];
      const len = degrees.length;

      // Set last chord to I (degree 0)
      degrees[len - 1] = 0;
      // Find tonic quality from home, or default to the home's first chord quality
      const tonicIdx = home.degrees.indexOf(0);
      qualities[len - 1] = tonicIdx >= 0 ? home.qualities[tonicIdx] : home.qualities[0];

      // Set second-to-last to V (degree 4) if we have room
      if (len >= 2) {
        degrees[len - 2] = 4;
        // Find V quality from home, or default to 'maj'
        const vIdx = home.degrees.indexOf(4);
        qualities[len - 2] = vIdx >= 0 ? home.qualities[vIdx] : 'maj';
      }

      return {
        degrees,
        qualities,
        barsPerChord: home.barsPerChord,
        loopCount: -1,
      };
    }

    case 'breakdown': {
      const tonicDeg = home.degrees[0];
      const tonicQuality = home.qualities[0];
      const distant = mostDistantDegree(home);
      const distantIdx = home.degrees.indexOf(distant);
      const distantQuality = distantIdx >= 0 ? home.qualities[distantIdx] : home.qualities[0];

      // If distant is same as tonic, just use single chord
      const degrees = distant !== tonicDeg ? [tonicDeg, distant] : [tonicDeg];
      const qualities = distant !== tonicDeg ? [tonicQuality, distantQuality] : [tonicQuality];

      return {
        degrees,
        qualities,
        barsPerChord: home.barsPerChord * 2,
        loopCount: -1,
      };
    }

    case 'groove':
    default:
      return {
        degrees: [...home.degrees],
        qualities: [...home.qualities],
        barsPerChord: home.barsPerChord,
        loopCount: home.loopCount,
      };
  }
}

/**
 * Get the chord at a specific bar position within a loop.
 *
 * The loop repeats infinitely (when loopCount = -1).
 * Each chord sustains for `barsPerChord` bars.
 *
 * @param loop  The progression loop
 * @param bar   Bar number (0-based)
 * @returns Object with degree and quality of the chord at that bar
 */
export function getLoopChordAtBar(
  loop: ProgressionLoop,
  bar: number,
): { degree: number; quality: ChordQuality } {
  const totalBars = loop.degrees.length * loop.barsPerChord;
  const barInLoop = bar % totalBars;
  const chordIndex = Math.floor(barInLoop / loop.barsPerChord);

  return {
    degree: loop.degrees[chordIndex],
    quality: loop.qualities[chordIndex],
  };
}
