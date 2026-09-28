import { nailPath, type NailShape } from '../lib/nailShapes'

/**
 * Nail outline sized in real millimetres, centred on its box. Drawn with the
 * free edge pointing down (towards the bottom of the phone), the way the tip is
 * held while tracing.
 */
export function NailGuide({
  shape,
  widthMm,
  lengthMm,
  pxPerMm,
  color,
  opacity = 1,
  rotation = 0,
  strokeWidth = 2,
  dashed = true,
  anchor = 'top-1/2',
  label,
}: {
  shape: NailShape
  widthMm: number
  lengthMm: number
  pxPerMm: number
  color: string
  opacity?: number
  rotation?: number
  strokeWidth?: number
  dashed?: boolean
  /** Tailwind `top-*` class for the vertical anchor point. */
  anchor?: string
  /** Small caption drawn inside the outline, near the free edge. */
  label?: string
}) {
  const w = widthMm * pxPerMm
  const h = lengthMm * pxPerMm
  const pad = strokeWidth * 2
  return (
    <svg
      width={w + pad * 2}
      height={h + pad * 2}
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      className={`pointer-events-none absolute left-1/2 overflow-visible ${anchor}`}
      style={{
        opacity,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      aria-hidden
    >
      <g transform={`rotate(180 ${w / 2} ${h / 2})`}>
        <path
          d={nailPath(shape, w, h)}
          fill={color}
          fillOpacity={0.08}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashed ? '6 4' : undefined}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      {label && h > 60 && (
        <text x={w / 2} y={Math.min(w * 0.3, h * 0.3) + 14} textAnchor="middle" fill={color} fillOpacity={0.55} fontSize={9} letterSpacing={2} fontFamily="'DM Mono', monospace">
          {label}
        </text>
      )}
      {/* centre line helps align symmetrical designs */}
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={color} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="2 4" />
    </svg>
  )
}
