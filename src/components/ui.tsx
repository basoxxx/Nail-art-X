import type { CSSProperties, ReactNode } from 'react'

/** Gold-framed card with the reference's thin champagne border. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[26px] border border-gold-soft/60 bg-panel ${className}`}>{children}</div>
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-2.5 border-t border-line px-4 py-4 first:border-t-0">
      <div className="flex items-center justify-between">
        <h3 className="label">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  )
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  label: string
}) {
  const p = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      style={{ '--p': `${p}%` } as CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

type Variant = 'outline' | 'pink' | 'ghost'

export function Btn({
  children,
  onClick,
  active,
  variant = 'outline',
  className = '',
  label,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  active?: boolean
  variant?: Variant
  className?: string
  label?: string
  disabled?: boolean
}) {
  const look =
    variant === 'pink' || active
      ? 'bg-pink text-ink border-pink'
      : variant === 'ghost'
        ? 'border-transparent text-muted'
        : 'border-line bg-panel-2 text-cream hover:border-gold-soft'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition active:scale-[0.97] disabled:opacity-40 ${look} ${className}`}
    >
      {children}
    </button>
  )
}

export function NumberField({
  value,
  onChange,
  step,
  min,
  max,
  suffix,
  label,
}: {
  value: number
  onChange: (v: number) => void
  step: number
  min: number
  max: number
  suffix?: string
  label: string
}) {
  const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0
  return (
    <label className="flex h-11 items-center rounded-2xl border border-line bg-panel-2 px-3 text-sm">
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        className="w-14 bg-transparent text-right font-mono tabular-nums outline-none"
        // key forces re-sync when the value changes from gestures/sliders
        key={value.toFixed(decimals)}
        defaultValue={value.toFixed(decimals)}
        step={step}
        min={min}
        max={max}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
      {suffix && <span className="ml-1.5 font-mono text-xs text-muted">{suffix}</span>}
    </label>
  )

  function commit(raw: string) {
    const n = Number(raw.replace(',', '.'))
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)))
  }
}

/** Monospace value readout shown at the right of a section title. */
export function Value({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-cream tabular-nums">{children}</span>
}

// --- Icons (inline, stroke-based, 24px grid) ---

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export const icons = {
  image: <Icon d="M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5 M15.5 9.5h.01" />,
  lock: <Icon d="M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3" />,
  unlock: <Icon d="M6 11h12v9H6z M8 11V8a4 4 0 0 1 7.5-2" />,
  ruler: <Icon d="M3 16 16 3l5 5L8 21z M7 12l2 2 M10 9l2 2 M13 6l2 2" />,
  sun: <Icon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" />,
  moon: <Icon d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  flipH: <Icon d="M12 3v18 M8 7 3 12l5 5z M16 7l5 5-5 5z" />,
  flipV: <Icon d="M3 12h18 M7 8l5-5 5 5z M7 16l5 5 5-5z" />,
  rotL: <Icon d="M4 4v5h5 M4.5 9A8 8 0 1 1 6 17" />,
  rotR: <Icon d="M20 4v5h-5 M19.5 9A8 8 0 1 0 18 17" />,
  center: <Icon d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  reset: <Icon d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5" />,
  chevronUp: <Icon d="M6 15l6-6 6 6" />,
  chevronDown: <Icon d="M6 9l6 6 6-6" />,
  eye: <Icon d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  eyeOff: <Icon d="M3 3l18 18 M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2 M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />,
  target: <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />,
  check: <Icon d="M5 12l5 5L20 7" />,
  x: <Icon d="M6 6l12 12 M18 6 6 18" />,
  download: <Icon d="M12 3v12 M7 10l5 5 5-5 M5 21h14" />,
  plus: <Icon d="M12 5v14 M5 12h14" />,
  arrowRight: <Icon d="M5 12h14 M13 6l6 6-6 6" />,
}
