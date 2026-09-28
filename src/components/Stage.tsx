import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useGesture } from '@use-gesture/react'
import { useStore } from '../lib/store'
import { NailGuide } from './NailGuide'
import { Ruler } from './Ruler'
import { icons } from './ui'

const GRID_MM = 5

/**
 * The lightbox surface: design image + nail guide, both at real scale, on a
 * paper background with a real-millimetre grid. One finger pans, two fingers
 * pinch-zoom and rotate, double tap re-centres.
 */
export function Stage({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const lastTap = useRef(0)
  const [stageWidth, setStageWidth] = useState(0)

  const { image, transform: t, guide, pxPerMm, background, showRuler, locked, updateTransform } = useStore()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], pinching, tap, last, cancel }) => {
        if (pinching) return cancel()
        if (tap && last) {
          const now = Date.now()
          if (now - lastTap.current < 320) updateTransform({ xMm: 0, yMm: 0 })
          lastTap.current = now
          return
        }
        const s = useStore.getState()
        updateTransform({ xMm: s.transform.xMm + dx / s.pxPerMm, yMm: s.transform.yMm + dy / s.pxPerMm })
      },
      onPinch: ({ da: [d, a], first, memo }) => {
        const s = useStore.getState().transform
        const m = first || !memo ? { d, a, w: s.widthMm, r: s.rotation } : memo
        updateTransform({ widthMm: (m.w * d) / m.d, rotation: m.r + (a - m.a) })
        return m
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault()
        const s = useStore.getState().transform
        updateTransform({ widthMm: s.widthMm * Math.exp(-dy * 0.0015) })
      },
    },
    {
      target: ref,
      enabled: !!image && !locked,
      eventOptions: { passive: false },
      drag: { filterTaps: true, pointer: { touch: true } },
      pinch: { pointer: { touch: true } },
    },
  )

  const dark = background === 'black'
  const widthPx = t.widthMm * pxPerMm
  const grid = GRID_MM * pxPerMm
  const gridLine = dark ? 'rgb(255 255 255 / 0.07)' : 'rgb(60 45 30 / 0.07)'

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      style={{
        touchAction: 'none',
        backgroundColor: dark ? '#000' : 'var(--color-paper)',
        backgroundImage: `linear-gradient(to right, ${gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
        backgroundSize: `${grid}px ${grid}px`,
        backgroundPosition: 'center',
      }}
    >
      {image && (
        <img
          src={image.url}
          alt="Design di riferimento"
          draggable={false}
          className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
          style={{
            width: widthPx,
            height: (widthPx * image.naturalHeight) / image.naturalWidth,
            opacity: t.opacity,
            transform: `translate(-50%, -50%) translate(${t.xMm * pxPerMm}px, ${t.yMm * pxPerMm}px) rotate(${t.rotation}deg) scale(${t.flipX ? -1 : 1}, ${t.flipY ? -1 : 1})`,
            willChange: 'transform',
            // White paper areas of a photo/scan disappear, so the grid and guide show through.
            mixBlendMode: dark ? 'normal' : 'multiply',
          }}
        />
      )}

      {guide.visible && (
        <NailGuide
          shape={guide.shape}
          widthMm={guide.widthMm}
          lengthMm={guide.lengthMm}
          pxPerMm={pxPerMm}
          color={guide.color}
          opacity={guide.opacity}
          rotation={guide.rotation}
          label="GUIDA"
        />
      )}

      {locked && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <div className="label flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[#5a5046]! shadow-md">
            {icons.lock} Design bloccato
          </div>
        </div>
      )}

      {showRuler && stageWidth > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-3">
          <Ruler pxPerMm={pxPerMm} lengthMm={(stageWidth - 48) / pxPerMm} dark={dark} />
        </div>
      )}

      {children}
    </div>
  )
}
