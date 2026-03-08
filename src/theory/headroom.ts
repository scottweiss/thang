/**
 * Headroom management — prevent clipping when many layers are active.
 *
 * When 6 layers stack, their combined output can exceed the comfortable
 * listening range. Real mix engineers use a master bus compressor or
 * simply turn things down as more instruments enter.
 *
 * This module provides a gain scalar based on active layer count:
 * - 1-2 layers: no reduction (solo instruments are fine)
 * - 3-4 layers: gentle reduction (-1 to -3 dB)
 * - 5-6 layers: moderate reduction (-3 to -5 dB)
 *
 * The reduction is smooth (not stepped) to avoid audible jumps.
 */

/**
 * Compute a master gain scalar based on active layer count.
 *
 * @param activeCount  Number of currently sounding layers
 * @returns Gain multiplier (0.5 - 1.0)
 */
export function headroomScalar(activeCount: number): number {
  if (activeCount <= 2) return 1.0;

  // Smooth curve: each additional layer reduces by ~1 dB
  // Formula: 1.0 / (1.0 + (count - 2) * 0.09)
  // 3 layers: 0.92, 4 layers: 0.85, 5 layers: 0.79, 6 layers: 0.73
  const excess = Math.max(0, activeCount - 2);
  return 1.0 / (1.0 + excess * 0.09);
}

/**
 * Whether headroom management should be applied.
 * Only needed when 3+ layers are sounding.
 */
export function shouldApplyHeadroom(activeCount: number): boolean {
  return activeCount >= 3;
}
