import { NAIL_SHAPES } from '../lib/nailShapes'
import { PX_PER_MM_MAX, PX_PER_MM_MIN } from '../lib/calibration'
import { WIDTH_MM_MAX, WIDTH_MM_MIN, useStore } from '../lib/store'
import { Btn, Card, NumberField, Section, Slider, Value, icons } from './ui'

const GUIDE_COLORS = ['#8a8076', '#b8906a', '#d9749f', '#1f1b17', '#3aa7b8']

/** All editing controls, stacked in gold-framed cards below the canvas. */
export function ControlPanel({ onCalibrate }: { onCalibrate: () => void }) {
  const image = useStore((s) => s.image)
  return (
    <div className="space-y-4">
      {image && (
        <Card>
          <DesignControls />
        </Card>
      )}
      <Card>
        <GuideControls />
      </Card>
      <Card>
        <ScaleControls onCalibrate={onCalibrate} />
      </Card>
    </div>
  )
}

function DesignControls() {
  const { transform: t, guide, updateTransform, resetTransform } = useStore()
  return (
    <>
      <Section title="Rotazione" right={<Value>{t.rotation.toFixed(0)}°</Value>}>
        <div className="grid grid-cols-[1fr_1fr_1.4fr_1fr_1fr] gap-2">
          <Btn onClick={() => updateTransform({ rotation: t.rotation - 15 })} label="Ruota -15°" className="px-1 text-xs">{icons.rotL}15</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation - 1 })} label="Ruota -1°" className="px-1 font-mono text-xs">−1°</Btn>
          <Btn onClick={() => updateTransform({ rotation: 0 })} label="Rotazione a 0°" className="px-1">{icons.reset}</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation + 1 })} label="Ruota +1°" className="px-1 font-mono text-xs">+1°</Btn>
          <Btn onClick={() => updateTransform({ rotation: t.rotation + 15 })} label="Ruota +15°" className="px-1 text-xs">15{icons.rotR}</Btn>
        </div>
        <Slider value={t.rotation} min={-180} max={180} step={1} onChange={(rotation) => updateTransform({ rotation })} label="Rotazione design" />
      </Section>

      <Section title="Design">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => updateTransform({ flipX: !t.flipX })} active={t.flipX} className="min-h-14 font-display text-base">
            {icons.flipH} Flip orizzontale
          </Btn>
          <Btn onClick={() => updateTransform({ flipY: !t.flipY })} active={t.flipY} className="min-h-14 font-display text-base">
            {icons.flipV} Flip verticale
          </Btn>
        </div>
      </Section>

      <Section title="Opacità" right={<Value>{Math.round(t.opacity * 100)}%</Value>}>
        <Slider value={t.opacity} min={0.05} max={1} step={0.01} onChange={(opacity) => updateTransform({ opacity })} label="Opacità design" />
        <div className="label flex justify-between text-[10px]!">
          <span>Tenue</span>
          <span>Pieno</span>
        </div>
      </Section>

      <Section title="Larghezza reale" right={<Value>{t.widthMm.toFixed(1)} mm</Value>}>
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

      <Section title="Posizione">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => updateTransform({ xMm: 0, yMm: 0 })}>{icons.center} Centra</Btn>
          <Btn onClick={resetTransform}>{icons.reset} Ripristina</Btn>
        </div>
        <p className="text-[11px] text-muted">1 dito sposta · 2 dita zoom e rotazione · doppio tap centra</p>
      </Section>
    </>
  )
}

function GuideControls() {
  const { guide: g, tipWidthMm, calibrated, background, updateGuide, setBackground } = useStore()
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="text-gold">{g.visible ? icons.eye : icons.eyeOff}</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg leading-tight">Guida unghia</div>
          <div className="text-xs text-muted">Sagoma di posizionamento</div>
        </div>
        <Btn onClick={() => updateGuide({ visible: !g.visible })} className="rounded-full text-xs">
          {g.visible ? 'Nascondi' : 'Mostra'}
        </Btn>
      </div>

      {g.visible && (
        <>
          <Section title="Forma">
            <div className="grid grid-cols-5 gap-1.5">
              {NAIL_SHAPES.map((s) => (
                <Btn key={s.id} onClick={() => updateGuide({ shape: s.id })} active={g.shape === s.id} className="px-0.5 text-[11px]">
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

          <Section title="Opacità guida" right={<Value>{Math.round(g.opacity * 100)}%</Value>}>
            <Slider value={g.opacity} min={0.1} max={1} step={0.01} onChange={(opacity) => updateGuide({ opacity })} label="Opacità guida" />
          </Section>

          <Section title="Inclinazione" right={<Value>{g.rotation}°</Value>}>
            <Slider value={g.rotation} min={-45} max={45} step={1} onChange={(rotation) => updateGuide({ rotation })} label="Inclinazione guida" />
          </Section>

          <Section title="Colore guida">
            <div className="flex gap-2.5">
              {GUIDE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Colore ${c}`}
                  onClick={() => updateGuide({ color: c })}
                  className={`h-9 w-9 rounded-full border-2 ${g.color === c ? 'border-gold' : 'border-line'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Section>
        </>
      )}

      <Section title="Sfondo">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => setBackground('white')} active={background === 'white'}>{icons.sun} Carta</Btn>
          <Btn onClick={() => setBackground('black')} active={background === 'black'}>{icons.moon} Nero</Btn>
        </div>
      </Section>
    </>
  )
}

function ScaleControls({ onCalibrate }: { onCalibrate: () => void }) {
  const { pxPerMm, calibrated, showRuler, setPxPerMm, setShowRuler } = useStore()
  const nudge = (pct: number) => setPxPerMm(pxPerMm * (1 + pct), true)

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="text-gold">{icons.target}</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg leading-tight">Scala reale</div>
          <div className="text-xs text-muted">
            {calibrated ? 'Calibrata con la tip' : 'Stimata: può sbagliare del 10-20%'}
          </div>
        </div>
        <Btn onClick={onCalibrate} variant={calibrated ? 'outline' : 'pink'} className="rounded-full text-xs">
          {calibrated ? 'Ricalibra' : 'Calibra'}
        </Btn>
      </div>

      <Section title="Regolazione fine" right={<Value>≈{Math.round(pxPerMm * 25.4)} ppi</Value>}>
        <div className="flex items-center gap-2">
          <Btn onClick={() => nudge(-0.005)} label="Riduci scala dello 0,5%">−</Btn>
          <NumberField value={pxPerMm} onChange={(v) => setPxPerMm(v, true)} step={0.01} min={PX_PER_MM_MIN} max={PX_PER_MM_MAX} suffix="px/mm" label="Pixel per millimetro" />
          <Btn onClick={() => nudge(0.005)} label="Aumenta scala dello 0,5%">+</Btn>
        </div>
      </Section>

      <Section title="Verifica">
        <Btn onClick={() => setShowRuler(!showRuler)} active={showRuler} className="w-full">
          {icons.ruler} {showRuler ? 'Nascondi righello' : 'Mostra righello sul canvas'}
        </Btn>
        <p className="text-[11px] text-muted">
          I quadretti della griglia sono di 5 mm. Appoggia un righello vero: se combaciano, la scala è corretta.
        </p>
      </Section>
    </>
  )
}
