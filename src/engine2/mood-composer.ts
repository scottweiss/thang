/**
 * A MoodComposer answers the composition-time questions that define a mood.
 * Replaces ~250 scattered `Record<Mood, T>` tables with a single object per
 * mood that owns its identity.
 */

import type { NoteName, ScaleType, ChordQuality } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';

export interface Progression {
  /** One entry per `barsPerChord` bars */
  degrees: number[];
  qualities: ChordQuality[];
  barsPerChord: number;
}

export interface MoodComposer {
  name: string;

  /** Fresh key every time; respects mood aesthetic (bright/dark, etc) */
  pickKey(): { root: NoteName; scaleType: ScaleType };

  /** BPM for this piece; may vary slightly within the mood's range */
  pickTempo(): number;

  /** Which instruments play which roles for this mood */
  pickVoicing(): Voicing;

  /** Build a 4-bar chord loop. Called once per phrase. */
  buildProgression(scaleType: ScaleType): Progression;

  /**
   * Build a short melodic cell. Scale degrees are 0-based (0 = tonic,
   * 2 = third, 4 = fifth, etc). The Performer maps these onto the actual
   * key at render time.
   */
  buildMotif(scaleType: ScaleType): Motif;

  /** Structure for a section: length, active roles, target intensity */
  sectionShape(type: SectionType): SectionShape;

  /** Which bar positions in a 4-bar phrase carry a motif statement */
  motifSlots(bars: number): boolean[];

  /** Cadence type for the phrase ending — determines chord targeting */
  cadenceFor(sectionType: SectionType, phraseIdxWithinSection: number, totalPhrases: number): CadenceType;

  /**
   * Drum pattern for a phrase (optional — return null if this mood doesn't
   * use drums, or if the section shouldn't). Called once per phrase; the
   * returned pattern loops across the phrase's bars.
   */
  buildPulse?(sectionType: SectionType, phraseIdx: number, totalPhrases: number): PulsePattern | null;
}
