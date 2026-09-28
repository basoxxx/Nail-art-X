import { useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { icons } from './ui'

const TRACK_W = 260
const THUMB = 52
const TRAVEL = TRACK_W - THUMB - 8

/**
 * Full-screen shield that swallows every touch while the artist rests a tip or
 * brush on the glass. Only a deliberate slide of the thumb unlocks — a tip or
 * finger simply resting on the track does nothing.
 */
export function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  const [x, setX] = useState(0)
  const drag = useRef<{ id: number; startX: number } | null>(null)

  const swallow = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDown = (e: RPointerEvent) => {
    swallow(e)
    if (drag.current) return // ignore a second finger
    drag.current = { id: e.pointerId, startX: e.clientX - x }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent) => {
    swallow(e)
    if (drag.current?.id !== e.pointerId) return
    setX(Math.min(TRAVEL, Math.max(0, e.clientX - drag.current.startX)))
  }
  const onUp = (e: RPointerEvent) => {
    swallow(e)
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    if (x >= TRAVEL * 0.92) onUnlock()
    else setX(0)
  }

  const progress = x / TRAVEL

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ touchAction: 'none' }}
      onPointerDown={swallow}
      onPointerMove={swallow}
      onPointerUp={swallow}
      onTouchStart={(e) => e.stopPropagation()}
      onContextMenu={swallow}
      onDoubleClick={swallow}
      role="dialog"
      aria-label="Interfaccia bloccata"
    >
      <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">
          {icons.lock} Bloccato
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] flex justify-center">
        <div
          className="relative flex h-[60px] items-center rounded-full bg-black/45 p-1 backdrop-blur"
          style={{ width: TRACK_W }}
        >
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-sm font-medium text-white/80"
            style={{ opacity: 1 - progress * 1.5 }}
          >
            scorri per sbloccare
          </span>
          <div
            className="relative z-10 flex items-center justify-center rounded-full bg-white text-gray-900 shadow-lg"
            style={{
              width: THUMB,
              height: THUMB,
              transform: `translateX(${x}px)`,
              transition: drag.current ? 'none' : 'transform 200ms ease-out',
              touchAction: 'none',
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="slider"
            aria-label="Scorri per sbloccare"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            {progress > 0.9 ? icons.unlock : icons.arrowRight}
          </div>
        </div>
      </div>
    </div>
  )
}
