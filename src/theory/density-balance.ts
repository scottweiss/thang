/**
 * Adaptive density balancing — automatic thinning when texture is crowded.
 *
 * When many layers are active simultaneously, the texture gets cluttered.
 * Rather than just adjusting frequency bands (which prevents spectral masking),
 * this module reduces the pattern density of secondary layers so there's
 * rhythmic breathing room for the primary voices.
 *
 * Layer priority (highest = preserved):
 * 1. melody — the foreground voice, never thinned
 * 2. harmony — the harmonic foundation
 * 3. drone — the tonal anchor
 * 4. arp — fills space but secondary
 * 5. texture — percussive support
 * 6. atmosphere — ambient background, most expendable
 *
 * The thinning amount depends on:
 * - How many layers are active (more layers = more thinning)
 * - The layer's priority (lower priority = more thinning)
 * - Current tension (high tension allows more density)
 */

/**
 * Priority ranking — lower number = higher priority (less thinning).
 */
const LAYER_PRIORITY: Record<string, number> = {
  melody: 0,
  harmony: 1,
  drone: 2,
  arp: 3,
  texture: 4,
  atmosphere: 5,
};

/**
 * Compute an additional degradation amount based on how crowded the mix is.
 *
 * @param layerName    Current layer
 * @param activeLayers Set of active layer names
 * @param tension      Current overall tension (0-1)
 * @returns Additional degrade amount (0-0.4) to apply on top of section-based degradation
 */
export function densityBalanceDegrade(
  layerName: string,
  activeLayers: Set<string>,
  tension: number
): number {
  const priority = LAYER_PRIORITY[layerName];
  if (priority === undefined) return 0;

  // Top-priority layers are never thinned by density balancing
  if (priority <= 1) return 0;

  const activeCount = activeLayers.size;

  // No thinning needed with 3 or fewer layers
  if (activeCount <= 3) return 0;

  // Base thinning: increases with layer count
  // 4 layers: slight, 5: moderate, 6: significant
  const countFactor = (activeCount - 3) * 0.08;

  // Priority scaling: lower-priority layers get thinned more
  // priority 2 (drone): 0.3x, priority 3 (arp): 0.6x, priority 4 (texture): 0.8x, priority 5 (atmo): 1.0x
  const priorityScale = Math.max(0, (priority - 1) * 0.25);

  // Tension reduces thinning — high tension sections can handle density
  const tensionRelief = tension * 0.5;

  const amount = countFactor * priorityScale * (1 - tensionRelief);

  // Clamp to 0-0.4 range (never more than 40% additional thinning)
  return Math.max(0, Math.min(0.4, amount));
}

/**
 * Whether density balancing should apply at all.
 */
export function shouldApplyDensityBalance(
  layerName: string,
  activeLayers: Set<string>
): boolean {
  const priority = LAYER_PRIORITY[layerName];
  if (priority === undefined || priority <= 1) return false;
  return activeLayers.size > 3;
}
