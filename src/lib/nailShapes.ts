export type NailShape = 'square' | 'oval' | 'coffin' | 'almond' | 'stiletto'

export const NAIL_SHAPES: { id: NailShape; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'oval', label: 'Oval' },
  { id: 'coffin', label: 'Coffin' },
  { id: 'almond', label: 'Almond' },
  { id: 'stiletto', label: 'Stiletto' },
]

/**
 * SVG path for a nail outline inside a w×h box: free edge at the top, cuticle
 * curve at the bottom. All shapes share the same cuticle so switching shape
 * only changes the tip.
 */
export function nailPath(shape: NailShape, w: number, h: number): string {
  const depth = Math.min(w * 0.3, h * 0.3) // cuticle curve depth
  const y0 = h - depth // where the straight sides meet the cuticle
  const k = depth * 1.333 // cubic control offset so the curve bottoms out at h
  const cuticle = `M 0 ${y0} C 0 ${y0 + k} ${w} ${y0 + k} ${w} ${y0}`

  let tip: string
  switch (shape) {
    case 'square': {
      const r = w * 0.12
      tip = `L ${w} ${r} Q ${w} 0 ${w - r} 0 L ${r} 0 Q 0 0 0 ${r}`
      break
    }
    case 'oval': {
      const r = w / 2
      const top = Math.min(r, y0)
      tip = `L ${w} ${top} A ${r} ${top} 0 0 0 0 ${top}`
      break
    }
    case 'coffin':
      tip = `L ${w} ${h * 0.45} L ${w * 0.78} ${w * 0.04} Q ${w * 0.76} 0 ${w * 0.72} 0 L ${w * 0.28} 0 Q ${w * 0.24} 0 ${w * 0.22} ${w * 0.04} L 0 ${h * 0.45}`
      break
    case 'almond':
      tip = `L ${w} ${h * 0.45} C ${w} ${h * 0.2} ${w * 0.68} 0 ${w / 2} 0 C ${w * 0.32} 0 0 ${h * 0.2} 0 ${h * 0.45}`
      break
    case 'stiletto':
      tip = `L ${w} ${h * 0.5} C ${w} ${h * 0.3} ${w * 0.58} ${h * 0.08} ${w / 2} 0 C ${w * 0.42} ${h * 0.08} 0 ${h * 0.3} 0 ${h * 0.5}`
      break
  }
  return `${cuticle} ${tip} Z`
}
