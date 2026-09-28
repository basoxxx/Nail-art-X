import { useState, type ReactNode } from 'react'
import { NAIL_SHAPES } from '../lib/nailShapes'
import { PX_PER_MM_MAX, PX_PER_MM_MIN } from '../lib/calibration'
import { WIDTH_MM_MAX, WIDTH_MM_MIN, useStore } from '../lib/store'
import { Btn, NumberField, Section, Slider, icons } from './ui'

type Tab = 'design' | 'guide' | 'scale'

const TABS: { id: Tab; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'guide', label: 'Guida' },
  { id: 'scale', label: 'Scala' },
]

const GUIDE_COLORS = ['#ec4899', '#111827', '#06b6d4', '#ef4444', '#22c55e']

export function ControlPanel({ onCalibrate }: { onCalibrate: () => void }) {
  const [tab, setTab] = useState<Tab>('design')
  const [open, setOpen] = useState(true)

  return (
    <div className="pointer-events-auto rounded-t-3xl border-t border-white/10 bg-gray-900/95 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur">
      <div className="flex items-center gap-1 px-3 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id)
              setOpen(true)
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
              open && tab === t.id ? 'bg-gray-800 text-white' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl p-2 text-gray-400"
          aria-label={open ? 'Riduci pannello' : 'Espandi pannello'}
        >
          {open ? icons.chevronDown : icons.chevronUp}
        </button>
      </div>
      {open && (
        <div className="max-h-[36dvh] space-y-4 overflow-y-auto px-4 pt-3 pb-4">
          {tab === 'design' && <DesignTab />}
          {tab === 'guide' && <GuideTab />}
          {tab === 'scale' && <ScaleTab onCalibrate={onCalibrate} />}
        </div>
      )}
    </div>
  )
}

function DesignTab() {
  const { image, transform: t, guide, updateTransform, resetTransform } = useStore()
  if (!image) return <p className="py-4 text-center text-sm text-gray-400">Carica un design per regolarlo.</p>

  return (
    <>
      <Section title="Opacità" right={<Value>{Math.round(t.opacity * 100)}%</Value>}>
        <Slider value={t.opacity} min={0.05} max={1} step={0.01} onChange={(opacity) => updateTransform({ opacity })} label="Opacità design" />
      </Section>

      <Section title="Larghezza reale">
        <div className="flex items-center gap-2">
          <Btn onClick={() => updateTransform({ widthMm: t.widthMm - 0.5 })} label="Riduci 0,5 mm">−</Btn>
          <NumberField value={t.widthMm} onChange={(widthMm) => updateTransform({ widthMm })} step={0.1} min={WIDTH_MM_MIN} max={WIDTH_MM_MAX} suffix="mm" label="Larghezza design in mm" />
          <Btn onClick={() => updateTransform({ widthMm: t.widthMm + 0.5 })} label="Aumenta 0,5 mm">+</Btn>
          <Btn onClick={() => updateTransform({ widthMm: guide.widthMm })} className="ml-auto text-xs" label="Adatta alla larghezza della guida">
            = guida
          </Btn>
        </div>
        <Slider value={Math.min(t.widthMm, 60)} min={WIDTH_MM_MIN} max={60} step={0.1} onChange={(widthMm) => updateTransform({ widthMm })} label="Larghezza design" />
      </Section>

      <Section title="Rotazione" right={<Value>{t.rotation.toFixed(0)}°</Value>}>
        <Slider value={t.rotation} min={-180} max={180} step={1} onChange={(rotation) => updateTransform({ rotation })} label="Rotazione design" />
        <div className="grid grid-cols-5 gap-1.5">
          <Btn onClick={() => updateTransform({ rotation: t.rotation - 15 })} label="Ruota -15°">{icons.rotL}15</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation - 1 })} label="Ruota -1°">−1°</Btn>
          <Btn onClick={() => updateTransform({ rotation: 0 })} label="Rotazione 0°">0°</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation + 1 })} label="Ruota +1°">+1°</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation + 15 })} label="Ruota +15°">15{icons.rotR}</Btn>
        </div>
      </Section>

      <Section title="Specchia e posizione">
        <div className="grid grid-cols-4 gap-1.5">
          <Btn onClick={() => updateTransform({ flipX: !t.flipX })} active={t.flipX} label="Specchia orizzontale">{icons.flipH}</Btn>
          <Btn onClick={() => updateTransform({ flipY: !t.flipY })} active={t.flipY} label="Specchia verticale">{icons.flipV}</Btn>
          <Btn onClick={() => updateTransform({ xMm: 0, yMm: 0 })} label="Centra">{icons.center}</Btn>
          <Btn onClick={resetTransform} label="Ripristina tutto">{icons.reset}</Btn>
        </div>
        <p className="text-[11px] text-gray-500">1 dito: sposta · 2 dita: zoom e rotazione · doppio tap: centra</p>
      </Section>
    </>
  )
}

function GuideTab() {
  const { guide: g, tipWidthMm, calibrated, updateGuide } = useStore()
  return (
    <>
      <Section
        title="Sagoma unghia"
        right={
          <Btn onClick={() => updateGuide({ visible: !g.visible })} active={g.visible} className="min-h-8 text-xs" label="Mostra o nascondi guida">
            {g.visible ? icons.eye : icons.eyeOff}
            {g.visible ? 'Visibile' : 'Nascosta'}
          </Btn>
        }
      >
        <div className="grid grid-cols-5 gap-1.5">
          {NAIL_SHAPES.map((s) => (
            <Btn key={s.id} onClick={() => updateGuide({ shape: s.id })} active={g.shape === s.id} className="px-1 text-xs">
              {s.label}
            </Btn>
          ))}
        </div>
      </Section>

      <Section title="Larghezza" right={<Value>{g.widthMm.toFixed(1)} mm</Value>}>
        <div className="flex items-center gap-2">
          <Slider value={g.widthMm} min={6} max={22} step={0.5} onChange={(widthMm) => updateGuide({ widthMm })} label="Larghezza guida" />
          {calibrated && (
            <Btn onClick={() => updateGuide({ widthMm: tipWidthMm })} className="shrink-0 text-xs" label="Usa larghezza della tip calibrata">
              tip {tipWidthMm}
            </Btn>
          )}
        </div>
      </Section>

      <Section title="Lunghezza" right={<Value>{g.lengthMm.toFixed(1)} mm</Value>}>
        <Slider value={g.lengthMm} min={8} max={45} step={0.5} onChange={(lengthMm) => updateGuide({ lengthMm })} label="Lunghezza guida" />
      </Section>

      <Section title="Opacità" right={<Value>{Math.round(g.opacity * 100)}%</Value>}>
        <Slider value={g.opacity} min={0.1} max={1} step={0.01} onChange={(opacity) => updateGuide({ opacity })} label="Opacità guida" />
      </Section>

      <Section title="Inclinazione" right={<Value>{g.rotation}°</Value>}>
        <Slider value={g.rotation} min={-45} max={45} step={1} onChange={(rotation) => updateGuide({ rotation })} label="Inclinazione guida" />
      </Section>

      <Section title="Colore">
        <div className="flex gap-2">
          {GUIDE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colore ${c}`}
              onClick={() => updateGuide({ color: c })}
              className={`h-9 w-9 rounded-full border-2 ${g.color === c ? 'border-white' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Section>
    </>
  )
}

function ScaleTab({ onCalibrate }: { onCalibrate: () => void }) {
  const { pxPerMm, calibrated, showRuler, setPxPerMm, setShowRuler } = useStore()
  const nudge = (pct: number) => setPxPerMm(pxPerMm * (1 + pct), true)

  return (
    <>
      <div className={`rounded-2xl p-3 text-sm ${calibrated ? 'bg-emerald-900/40 text-emerald-200' : 'bg-amber-900/40 text-amber-200'}`}>
        {calibrated
          ? 'Scala calibrata con la tip. Puoi rifinirla qui sotto o ricalibrare.'
          : 'Scala stimata automaticamente (può sbagliare del 10-20%). Calibra con una tip per la misura reale.'}
      </div>

      <Btn onClick={onCalibrate} active className="w-full">
        {icons.target} {calibrated ? 'Ricalibra con la tip' : 'Calibra con la tip'}
      </Btn>

      <Section title="Regolazione manuale" right={<Value>≈{Math.round(pxPerMm * 25.4)} ppi</Value>}>
        <div className="flex items-center gap-2">
          <Btn onClick={() => nudge(-0.005)} label="Riduci scala dello 0,5%">−</Btn>
          <NumberField value={pxPerMm} onChange={(v) => setPxPerMm(v, true)} step={0.01} min={PX_PER_MM_MIN} max={PX_PER_MM_MAX} suffix="px/mm" label="Pixel per millimetro" />
          <Btn onClick={() => nudge(0.005)} label="Aumenta scala dello 0,5%">+</Btn>
        </div>
      </Section>

      <Section title="Verifica">
        <Btn onClick={() => setShowRuler(!showRuler)} active={showRuler} className="w-full">
          {icons.ruler} {showRuler ? 'Nascondi righello' : 'Mostra righello a schermo'}
        </Btn>
        <p className="text-[11px] text-gray-500">
          Appoggia un righello vero sul righello a schermo: se le tacche combaciano la scala è corretta.
        </p>
      </Section>
    </>
  )
}

function Value({ children }: { children: ReactNode }) {
  return <span className="text-xs text-gray-300 tabular-nums">{children}</span>
}
