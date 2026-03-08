/**
 * Phrase structure for musical form.
 *
 * Music naturally organizes into phrases — groups of notes with
 * internal momentum and breathing space between them. This module
 * provides tools for creating phrase-level structure in generated
 * patterns, rather than scattering notes uniformly.
 *
 * Key concepts:
 * - Phrase: a group of notes that form a musical thought (2-8 notes)
 * - Breath: silence between phrases for musical space
 * - Phrase arc: intensity builds within a phrase, peaks, then relaxes
 */

export interface PhraseShape {
  noteCount: number;    // how many notes in this phrase
  startSlot: number;    // time slot where phrase begins
  breathAfter: number;  // slots of silence after phrase
}

/**
 * Generate a phrase plan for a given number of total slots.
 * Divides the slots into phrases with breathing space between them.
 *
 * @param totalSlots     Total time slots available (e.g., 16 for 16th notes)
 * @param avgPhraseLen   Average notes per phrase (2-6)
 * @param breathiness    How much space between phrases (0-1, higher = more breath)
 * @returns Array of phrase shapes
 */
export function generatePhraseStructure(
  totalSlots: number,
  avgPhraseLen: number,
  breathiness: number
): PhraseShape[] {
  if (totalSlots <= 0) return [];

  const phrases: PhraseShape[] = [];
  let currentSlot = 0;

  // Minimum breath gap scales with breathiness
  const minBreath = Math.max(1, Math.round(breathiness * 3));

  while (currentSlot < totalSlots) {
    // Phrase length: vary around average with some randomness
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const noteCount = Math.max(1, Math.min(
      totalSlots - currentSlot,
      avgPhraseLen + variation
    ));

    // Calculate remaining space
    const slotsUsed = noteCount;
    const remainingAfter = totalSlots - currentSlot - slotsUsed;

    // Breath: proportional to breathiness, but don't exceed remaining space
    const breathTarget = Math.round(minBreath + Math.random() * breathiness * 2);
    const breathAfter = Math.min(breathTarget, Math.max(0, remainingAfter));

    phrases.push({
      noteCount,
      startSlot: currentSlot,
      breathAfter,
    });

    currentSlot += slotsUsed + breathAfter;
  }

  return phrases;
}

/**
 * Generate a phrase-aware density mask.
 * Returns an array of booleans indicating which slots should have notes.
 * Notes cluster into phrases instead of being uniformly distributed.
 *
 * @param totalSlots    Total slots
 * @param targetDensity Overall target density (0-1)
 * @param breathiness   How much space between phrases (0-1)
 * @returns Boolean array — true = note, false = rest
 */
export function phraseDensityMask(
  totalSlots: number,
  targetDensity: number,
  breathiness: number
): boolean[] {
  if (totalSlots <= 0) return [];

  const targetNotes = Math.max(1, Math.round(totalSlots * targetDensity));
  const avgPhraseLen = Math.max(2, Math.min(6, Math.round(targetNotes / 2)));

  const phrases = generatePhraseStructure(totalSlots, avgPhraseLen, breathiness);
  const mask = new Array(totalSlots).fill(false);

  let notesPlaced = 0;
  for (const phrase of phrases) {
    if (notesPlaced >= targetNotes) break;

    const phraseEnd = Math.min(totalSlots, phrase.startSlot + phrase.noteCount);
    for (let i = phrase.startSlot; i < phraseEnd && notesPlaced < targetNotes; i++) {
      mask[i] = true;
      notesPlaced++;
    }
  }

  return mask;
}

/**
 * Generate a phrase-aware intensity curve.
 * Each phrase has an internal arc: build to a peak then relax.
 * Returns values 0-1 per slot indicating relative intensity.
 *
 * @param totalSlots  Total slots
 * @param phrases     Phrase shapes from generatePhraseStructure
 * @returns Array of intensity values (0-1)
 */
export function phraseIntensityCurve(
  totalSlots: number,
  phrases: PhraseShape[]
): number[] {
  const curve = new Array(totalSlots).fill(0);

  for (const phrase of phrases) {
    const len = phrase.noteCount;
    const peakPos = Math.floor(len * 0.6); // peak at 60% through phrase

    for (let i = 0; i < len; i++) {
      const slot = phrase.startSlot + i;
      if (slot >= totalSlots) break;

      if (i <= peakPos) {
        // Build up
        curve[slot] = 0.3 + 0.7 * (i / peakPos);
      } else {
        // Relax
        const remaining = len - peakPos;
        curve[slot] = 1.0 - 0.5 * ((i - peakPos) / remaining);
      }
    }
  }

  return curve;
}
