import { nailPath, type NailShape } from '../lib/nailShapes'

/**
 * Nail outline sized in real millimetres, centred on its box. Drawn with the
 * free edge pointing down (towards the bottom of the phone), the way the tip is
 * held while tracing.
 *
 * `layer` lets the canvas split the guide in two: the frosted fill goes under
 * the design (so it never washes it out) and the outline goes over it.
 */
export function NailGuide({
  shape,
  widthMm,
  lengthMm,
  pxPerMm,
  color,
  opacity = 1,
  rotation = 0,
  strokeWidth = 1.5,
  dashed = false,
  fill = '#ffffff',
  fillOpacity = 0.6,
  layer = 'both',
  centerLine = false,
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
  fill?: string
  fillOpacity?: number
  layer?: 'fill' | 'stroke' | 'both'
  centerLine?: boolean
  /** Tailwind `top-*` class for the vertical anchor point. */
  anchor?: string
  /** Small caption drawn inside the outline, just below the cuticle. */
  label?: string
}) {
  const w = widthMm * pxPerMm
  const h = lengthMm * pxPerMm
  const pad = 8 // room for the stroke and the soft shadow
  const showFill = layer !== 'stroke'
  const showStroke = layer !== 'fill'
  return (
    <svg
      width={w + pad * 2}
      height={h + pad * 2}
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      className={`pointer-events-none absolute left-1/2 overflow-visible ${anchor}`}
      style={{
        opacity,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        filter: showFill ? 'drop-shadow(0 2px 6px rgb(60 45 30 / 0.12))' : undefined,
      }}
      aria-hidden
    >
      <g transform={`rotate(180 ${w / 2} ${h / 2})`}>
        <path
          d={nailPath(shape, w, h)}
          fill={showFill ? fill : 'none'}
          fillOpacity={fillOpacity}
          stroke={showStroke ? color : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={dashed ? '6 4' : undefined}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      {showStroke && label && h > 60 && (
        <text
          x={w / 2}
          y={Math.min(w * 0.3, h * 0.3) + 14}
          textAnchor="middle"
          fill={color}
          fillOpacity={0.5}
          fontSize={9}
          letterSpacing={3}
          fontFamily="'DM Mono', monospace"
        >
          {label}
        </text>
      )}
      {/* optional centre line helps align symmetrical designs */}
      {showStroke && centerLine && (
        <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={color} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="2 4" />
      )}
    </svg>
  )
}
