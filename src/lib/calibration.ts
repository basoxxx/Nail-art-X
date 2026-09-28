// Real-world scale model: everything physical is expressed in millimetres and
// converted to CSS pixels through a single per-device factor, `pxPerMm`.

/** CSS reference: 96 CSS px per inch → ~3.78 px/mm. Correct for most desktops. */
const DESKTOP_PX_PER_MM = 96 / 25.4

/** Typical physical width of a phone screen in portrait (mm). */
const TYPICAL_PHONE_WIDTH_MM = 68

export const PX_PER_MM_MIN = 2
export const PX_PER_MM_MAX = 12

/**
 * First guess before the user calibrates. Phones render ~360–430 CSS px across a
 * ~62–75 mm wide panel, so dividing the short screen side by a typical physical
 * width lands within ~10% on most devices — close enough for the tip slider to
 * finish the job.
 */
export function estimatePxPerMm(): number {
  if (typeof window === 'undefined') return DESKTOP_PX_PER_MM
  const shortSide = Math.min(window.screen.width, window.screen.height)
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches
  if (isTouch && shortSide < 600) return clampPxPerMm(shortSide / TYPICAL_PHONE_WIDTH_MM)
  if (isTouch && shortSide < 1100) return clampPxPerMm(shortSide / 150) // tablets
  return DESKTOP_PX_PER_MM
}

export function clampPxPerMm(v: number): number {
  return Math.min(PX_PER_MM_MAX, Math.max(PX_PER_MM_MIN, v))
}

/** Approximate tip widths by size number, as sold in common 10–12 size kits. */
export const TIP_SIZES: { size: number; mm: number }[] = [
  { size: 0, mm: 18 },
  { size: 1, mm: 17 },
  { size: 2, mm: 16 },
  { size: 3, mm: 15 },
  { size: 4, mm: 14 },
  { size: 5, mm: 13 },
  { size: 6, mm: 12 },
  { size: 7, mm: 11 },
  { size: 8, mm: 10 },
  { size: 9, mm: 9 },
]
