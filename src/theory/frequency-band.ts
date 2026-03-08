/**
 * Frequency band allocation — dynamic frequency separation between layers.
 *
 * When multiple layers play simultaneously, their frequency ranges can
 * overlap and mask each other ("mud"). Real mix engineers use EQ to carve
 * out space for each instrument. This module does that automatically:
 *
 * - More active layers → tighter frequency bands per layer
 * - Fewer active layers → each layer gets more frequency range
 * - Each layer has a "home" frequency band that it naturally lives in
 *
 * Applied as HPF/LPF offsets in the post-processing pipeline.
 * Returns additive offsets — positive HPF offset = higher cutoff (tighter low end),
 * positive LPF offset = lower cutoff (tighter top end).
 */

/**
 * Frequency home ranges per layer (approximate Hz).
 * Each layer has a natural frequency center and range.
 */
const LAYER_BANDS: Record<string, { center: number; width: number }> = {
  drone:      { center: 150,  width: 300 },   // sub-bass to low-mid
  harmony:    { center: 400,  width: 600 },   // low-mid to mid
  melody:     { center: 1200, width: 1600 },  // mid to upper-mid
  texture:    { center: 2000, width: 4000 },  // drums span wide
  arp:        { center: 1800, width: 2000 },  // upper-mid
  atmosphere: { center: 800,  width: 2000 },  // mid, wide range
};

/**
 * When layers with adjacent frequency bands are both active,
 * we need to push them apart. These pairs define which layers
 * compete for frequency space and the HPF offset to apply.
 */
const COMPETING_PAIRS: { a: string; b: string; hpfOffset: number; lpfOffset: number }[] = [
  // Harmony and drone overlap in the low-mids
  { a: 'harmony', b: 'drone', hpfOffset: 40, lpfOffset: 0 },
  // Melody and arp compete in the upper-mids
  { a: 'arp', b: 'melody', hpfOffset: 60, lpfOffset: 0 },
  // Harmony and atmosphere overlap in the mids
  { a: 'atmosphere', b: 'harmony', hpfOffset: 30, lpfOffset: 0 },
  // Melody and harmony: push harmony's top down when melody is active
  { a: 'harmony', b: 'melody', hpfOffset: 0, lpfOffset: -200 },
];

/**
 * Compute HPF offset for a specific layer based on which layers are active.
 *
 * @param layerName   Name of the layer to compute offset for
 * @param activeLayers Set of currently active layer names
 * @returns Additive HPF offset in Hz (always >= 0)
 */
export function hpfBandOffset(layerName: string, activeLayers: Set<string>): number {
  let offset = 0;

  // Base offset scales with total active layer count
  // More layers = need tighter frequency separation
  const activeCount = activeLayers.size;
  const crowdingFactor = Math.max(0, (activeCount - 2) / 4); // 0 at 2 layers, 1 at 6 layers

  // Check competing pairs
  for (const pair of COMPETING_PAIRS) {
    if (pair.a === layerName && activeLayers.has(pair.b)) {
      offset += pair.hpfOffset * crowdingFactor;
    }
    if (pair.b === layerName && activeLayers.has(pair.a)) {
      // The other layer in the pair also gets a smaller offset
      offset += pair.hpfOffset * crowdingFactor * 0.3;
    }
  }

  return Math.round(offset);
}

/**
 * Compute LPF offset for a specific layer based on which layers are active.
 *
 * @param layerName   Name of the layer to compute offset for
 * @param activeLayers Set of currently active layer names
 * @returns Additive LPF offset in Hz (always <= 0, negative means lower cutoff)
 */
export function lpfBandOffset(layerName: string, activeLayers: Set<string>): number {
  let offset = 0;

  const activeCount = activeLayers.size;
  const crowdingFactor = Math.max(0, (activeCount - 2) / 4);

  for (const pair of COMPETING_PAIRS) {
    if (pair.a === layerName && activeLayers.has(pair.b)) {
      offset += pair.lpfOffset * crowdingFactor;
    }
  }

  return Math.round(offset);
}

/**
 * Whether frequency band separation should be applied.
 * Only needed when 3+ layers are active (otherwise plenty of room).
 */
export function shouldApplyBandSeparation(activeLayers: Set<string>): boolean {
  return activeLayers.size >= 3;
}
