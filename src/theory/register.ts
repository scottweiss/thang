/**
 * Register management for multi-layer counterpoint.
 *
 * Ensures layers occupy distinct frequency registers to avoid masking.
 * Each layer claims a register band; other layers adjust to avoid collision.
 * This is a genre-agnostic concept — whether it's ambient or disco,
 * clarity comes from giving each voice its own frequency space.
 */

export interface RegisterBand {
  low: number;   // MIDI note number
  high: number;  // MIDI note number
}

/** Default register assignments per layer */
const LAYER_REGISTERS: Record<string, RegisterBand> = {
  drone:     { low: 24, high: 48 },  // C1-C3: deep bass
  harmony:   { low: 48, high: 72 },  // C3-C5: mid range
  melody:    { low: 60, high: 84 },  // C4-C6: upper mid
  arp:       { low: 48, high: 84 },  // C3-C6: wide range (pattern-dependent)
  atmosphere:{ low: 24, high: 36 },  // C1-C2: sub-bass texture
};

/**
 * Get the recommended octave range for a layer, adjusted to avoid
 * collision with another layer's current register.
 *
 * @param layerName     The layer requesting a register
 * @param otherLayers   Map of other active layers to their current center pitches (MIDI)
 * @returns             Recommended [lowOctave, highOctave] for note generation
 */
export function getAdjustedOctaveRange(
  layerName: string,
  otherLayers: Record<string, number>
): [number, number] {
  const base = LAYER_REGISTERS[layerName];
  if (!base) return [3, 5]; // sensible default

  let lowMidi = base.low;
  let highMidi = base.high;

  // If melody and arp are both active, separate them
  if (layerName === 'melody' && otherLayers['arp'] !== undefined) {
    const arpCenter = otherLayers['arp'];
    if (arpCenter >= 66) {
      // Arp is high — push melody lower
      highMidi = Math.min(highMidi, 72);
    } else {
      // Arp is low — push melody higher
      lowMidi = Math.max(lowMidi, 64);
    }
  }

  if (layerName === 'arp' && otherLayers['melody'] !== undefined) {
    const melodyCenter = otherLayers['melody'];
    if (melodyCenter >= 72) {
      // Melody is high — keep arp lower
      highMidi = Math.min(highMidi, 72);
    } else {
      // Melody is low — push arp higher
      lowMidi = Math.max(lowMidi, 60);
    }
  }

  // Convert MIDI to octave numbers
  const lowOct = Math.floor(lowMidi / 12) - 1;
  const highOct = Math.floor(highMidi / 12) - 1;

  return [lowOct, highOct];
}

/**
 * Check if two register bands overlap significantly.
 * Returns overlap amount in semitones (0 = no overlap).
 */
export function registerOverlap(a: RegisterBand, b: RegisterBand): number {
  const overlapLow = Math.max(a.low, b.low);
  const overlapHigh = Math.min(a.high, b.high);
  return Math.max(0, overlapHigh - overlapLow);
}

/**
 * Given a set of active layers, compute a "clarity score" (0-1).
 * Higher = less register overlap = clearer mix.
 */
export function mixClarityScore(
  layerRegisters: Record<string, RegisterBand>
): number {
  const names = Object.keys(layerRegisters);
  if (names.length <= 1) return 1.0;

  let totalOverlap = 0;
  let totalRange = 0;
  let pairs = 0;

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const overlap = registerOverlap(layerRegisters[names[i]], layerRegisters[names[j]]);
      const maxRange = Math.max(
        layerRegisters[names[i]].high - layerRegisters[names[i]].low,
        layerRegisters[names[j]].high - layerRegisters[names[j]].low,
      );
      totalOverlap += overlap;
      totalRange += maxRange;
      pairs++;
    }
  }

  if (totalRange === 0) return 1.0;
  return Math.max(0, 1 - totalOverlap / totalRange);
}
