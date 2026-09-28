import { useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { icons } from './ui'

const TRACK_W = 250
const THUMB = 48
const TRAVEL = TRACK_W - THUMB - 8

/** Full-screen shield that swallows every touch while a tip or brush rests on the glass. */
export function LockOverlay() {
  const swallow = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault()
    e.stopPropagation()
  }
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
      aria-hidden
    />
  )
}

/**
 * Pink pill that sits above the shield. Only a deliberate slide of the thumb
 * unlocks: a tip or finger simply resting on the track does nothing.
 */
export function SlideToUnlock({ onUnlock }: { onUnlock: () => void }) {
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
      className="relative z-[60] flex h-14 items-center rounded-full bg-pink p-1 shadow-lg"
      style={{ width: TRACK_W, touchAction: 'none' }}
      onPointerDown={swallow}
    >
      <span
        className="label pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-[11px]! text-ink/75!"
        style={{ opacity: 1 - progress * 1.5 }}
      >
        Scorri per sbloccare
      </span>
      <div
        className="relative z-10 flex items-center justify-center rounded-full bg-[#fbf8f4] text-ink shadow"
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
        {progress > 0.9 ? icons.unlock : icons.lock}
      </div>
    </div>
  )
}
