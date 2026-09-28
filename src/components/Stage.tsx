import { useEffect, useRef, useState } from 'react'
import { useGesture } from '@use-gesture/react'
import { useStore } from '../lib/store'
import { NailGuide } from './NailGuide'
import { Ruler } from './Ruler'

/**
 * The lightbox surface: design image + nail guide, both at real scale.
 * One finger pans, two fingers pinch-zoom and rotate, double tap re-centres.
 */
export function Stage() {
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

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      style={{ background: dark ? '#000' : '#fff', touchAction: 'none' }}
    >
      {image && (
        <img
          src={image.url}
          alt="Design di riferimento"
          draggable={false}
          className="pointer-events-none absolute top-[38%] left-1/2 max-w-none select-none"
          style={{
            width: widthPx,
            height: (widthPx * image.naturalHeight) / image.naturalWidth,
            opacity: t.opacity,
            transform: `translate(-50%, -50%) translate(${t.xMm * pxPerMm}px, ${t.yMm * pxPerMm}px) rotate(${t.rotation}deg) scale(${t.flipX ? -1 : 1}, ${t.flipY ? -1 : 1})`,
            willChange: 'transform',
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
          anchor="top-[38%]"
        />
      )}

      {showRuler && stageWidth > 0 && (
        <div className="pointer-events-none absolute left-3 top-[calc(env(safe-area-inset-top)+4.25rem)]">
          <Ruler pxPerMm={pxPerMm} lengthMm={(stageWidth - 40) / pxPerMm} dark={dark} />
        </div>
      )}
    </div>
  )
}
