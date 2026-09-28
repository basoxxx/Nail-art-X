import { useRef, useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { PX_PER_MM_MAX, PX_PER_MM_MIN, TIP_SIZES, clampPxPerMm, estimatePxPerMm } from '../lib/calibration'
import { useStore } from '../lib/store'
import { NailGuide } from './NailGuide'
import { Ruler } from './Ruler'
import { Btn, NumberField, Section, Slider, icons } from './ui'

/**
 * Tip-based calibration: the user enters the real width of a tip, lays the
 * physical tip on the screen and resizes the outline until they match.
 * pxPerMm = on-screen outline width (px) / real tip width (mm).
 */
export function Calibration({ onClose }: { onClose: () => void }) {
  const store = useStore()
  const [tipMm, setTipMm] = useState(store.tipWidthMm)
  const [draft, setDraft] = useState(store.pxPerMm)
  const stageRef = useRef<HTMLDivElement>(null)

  // Horizontal drag on the outline area resizes it symmetrically: moving a
  // finger by dx grows the outline by 2·dx, i.e. 2·dx/tipMm px/mm.
  useDrag(
    ({ delta: [dx] }) => setDraft((d) => clampPxPerMm(d + (2 * dx) / tipMm)),
    { target: stageRef, eventOptions: { passive: false }, pointer: { touch: true } },
  )

  const nudge = (pct: number) => setDraft((d) => clampPxPerMm(d * (1 + pct)))
  const lengthMm = (store.guide.lengthMm / store.guide.widthMm) * tipMm

  const confirm = () => {
    store.setPxPerMm(draft, true)
    store.setTipWidthMm(tipMm)
    store.updateGuide({ widthMm: tipMm, lengthMm: Math.round(lengthMm * 2) / 2 })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink">
      <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2">
        <div>
          <h2 className="font-display text-2xl">Calibra la scala</h2>
          <p className="text-xs text-muted">Appoggia una tip vera sullo schermo e fai combaciare la sagoma.</p>
        </div>
        <Btn onClick={onClose} label="Chiudi">
          {icons.x}
        </Btn>
      </header>

      {/* Calibration surface: white like the lightbox so the physical tip is easy to see */}
      <div
        ref={stageRef}
        className="relative mx-3 flex-1 overflow-hidden rounded-[22px] border border-gold-soft/60 bg-paper"
        style={{ touchAction: 'none' }}
      >
        <NailGuide
          shape={store.guide.shape}
          widthMm={tipMm}
          lengthMm={lengthMm}
          pxPerMm={draft}
          color="#d9749f"
          strokeWidth={2}
          dashed={false}
        />
        <div className="label pointer-events-none absolute inset-x-0 top-3 text-center text-[10px]!">
          ↔ trascina per adattare
        </div>
        <div className="pointer-events-none absolute bottom-2 left-3">
          <Ruler pxPerMm={draft} lengthMm={Math.min(60, (window.innerWidth - 48) / draft)} />
        </div>
      </div>

      <div className="max-h-[48dvh] space-y-1 overflow-y-auto pt-1 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <Section title="Larghezza reale della tip">
          <div className="flex items-center gap-2">
            <NumberField value={tipMm} onChange={setTipMm} step={0.1} min={5} max={25} suffix="mm" label="Larghezza tip in mm" />
            <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
              {TIP_SIZES.map((t) => (
                <button
                  key={t.size}
                  type="button"
                  onClick={() => setTipMm(t.mm)}
                  className={`flex shrink-0 flex-col items-center rounded-xl border px-2.5 py-1 font-mono text-xs ${
                    tipMm === t.mm ? 'border-pink bg-pink text-ink' : 'border-line bg-panel-2 text-cream'
                  }`}
                >
                  <span className="font-semibold">#{t.size}</span>
                  <span className="opacity-75">{t.mm}mm</span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted">
            Le taglie variano per marca: misura la tip con un righello se puoi, poi scrivi il valore.
          </p>
        </Section>

        <Section
          title="Adatta la sagoma"
          right={<span className="font-mono text-xs text-cream tabular-nums">{draft.toFixed(2)} px/mm</span>}
        >
          <div className="flex items-center gap-2">
            <Btn onClick={() => nudge(-0.01)} label="Riduci">−</Btn>
            <Slider value={draft} min={PX_PER_MM_MIN} max={PX_PER_MM_MAX} step={0.01} onChange={setDraft} label="Scala px per mm" />
            <Btn onClick={() => nudge(0.01)} label="Ingrandisci">+</Btn>
          </div>
          <div className="flex justify-center gap-2">
            <Btn onClick={() => nudge(-0.002)} className="text-xs">−0.2%</Btn>
            <Btn onClick={() => nudge(0.002)} className="text-xs">+0.2%</Btn>
            <Btn onClick={() => setDraft(estimatePxPerMm())} className="text-xs">Stima automatica</Btn>
          </div>
        </Section>

        <div className="flex gap-2 px-4 pt-2">
          <Btn onClick={onClose} className="flex-1 rounded-full">Annulla</Btn>
          <Btn onClick={confirm} variant="pink" className="flex-1 rounded-full">
            {icons.check} Conferma
          </Btn>
        </div>
      </div>
    </div>
  )
}
