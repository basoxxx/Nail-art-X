import { useRef, useState, type ChangeEvent } from 'react'
import { useStore } from './lib/store'
import { useWakeLock } from './lib/useWakeLock'
import { useInstallPrompt } from './lib/useInstallPrompt'
import { Stage } from './components/Stage'
import { ControlPanel } from './components/ControlPanel'
import { Calibration } from './components/Calibration'
import { LockOverlay, SlideToUnlock } from './components/LockOverlay'
import { Btn, icons } from './components/ui'

export default function App() {
  const { image, locked, calibrated, setImage, setLocked } = useStore()
  const [calibrating, setCalibrating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const enteredFullscreen = useRef(false)
  const install = useInstallPrompt()

  useWakeLock(!!image || locked)

  const pickFile = () => fileRef.current?.click()

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImage({ url, name: file.name, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  const lock = async () => {
    // Bring the header (with the unlock slider) and the canvas into view.
    scrollRef.current?.scrollTo({ top: 0 })
    setLocked(true)
    // Fullscreen hides browser chrome that could be tapped by accident (not on iPhone Safari).
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        enteredFullscreen.current = true
      } catch {
        // not allowed / unsupported
      }
    }
  }

  const unlock = () => {
    setLocked(false)
    if (enteredFullscreen.current && document.fullscreenElement) document.exitFullscreen().catch(() => {})
    enteredFullscreen.current = false
  }

  return (
    <div ref={scrollRef} className="h-full" style={{ overflowY: locked ? 'hidden' : 'auto' }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <main className="mx-auto max-w-md space-y-4 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <header className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold bg-panel font-display text-2xl text-gold shadow-[3px_3px_0_var(--color-pink)]">
            X
          </div>
          <div className="min-w-0 flex-1">
            <div className="label text-[10px]! text-gold!">Lightbox digitale</div>
            <h1 className="font-display text-2xl leading-tight tracking-wide whitespace-nowrap uppercase">Nail Art X</h1>
          </div>
          <button
            type="button"
            onClick={() => setCalibrating(true)}
            className="label mt-1 flex shrink-0 items-center gap-2 rounded-full border border-gold-soft px-3 py-2 text-[10px]! text-cream!"
          >
            <span className={`h-2 w-2 rounded-full ${calibrated ? 'bg-gold' : 'bg-pink-strong animate-pulse'}`} />
            {calibrated ? 'Calibrato' : 'Stima'}
          </button>
        </header>

        <div className="label">Modalità ricalco / mani libere</div>
        <p className="text-sm leading-relaxed text-muted">
          Carica un riferimento, appoggia la tip sullo schermo e lascia lavorare le mani.
        </p>

        {locked ? (
          <SlideToUnlock onUnlock={unlock} />
        ) : (
          image && (
            <Btn onClick={lock} variant="pink" className="h-14 rounded-full px-5">
              {icons.lock} Blocca design
            </Btn>
          )
        )}

        {/* Canvas: double gold frame around the real-scale paper */}
        <div className="rounded-[30px] border border-gold/70 p-2">
          <div className="relative h-[62dvh] min-h-80 overflow-hidden rounded-[22px] border border-gold-soft/50">
            <Stage>
              {!image && (
                <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 px-6">
                  <Btn onClick={pickFile} variant="pink" className="w-full max-w-64 rounded-full">
                    {icons.image} Carica un design
                  </Btn>
                  {!calibrated && (
                    <Btn onClick={() => setCalibrating(true)} className="w-full max-w-64 rounded-full border-gold-soft bg-white/80 text-ink">
                      {icons.target} Calibra con una tip
                    </Btn>
                  )}
                </div>
              )}
            </Stage>
          </div>
        </div>

        {image && (
          <div className="flex items-baseline gap-3 px-1">
            <span className="label shrink-0 text-gold!">In modifica</span>
            <span className="truncate font-display text-lg text-cream/90">{image.name}</span>
          </div>
        )}

        <ControlPanel onCalibrate={() => setCalibrating(true)} />

        <div className="space-y-2.5 pt-2">
          {image && (
            <Btn onClick={lock} className="min-h-14 w-full rounded-full border-gold font-display text-lg">
              {icons.lock} Blocca design
            </Btn>
          )}
          <Btn onClick={pickFile} className="min-h-14 w-full rounded-full font-display text-lg">
            {icons.plus} {image ? 'Nuovo design' : 'Carica un design'}
          </Btn>
          {install.canPrompt && (
            <Btn onClick={install.install} variant="ghost" className="w-full">
              {icons.download} Installa l'app sul telefono
            </Btn>
          )}
          {install.showIosHint && (
            <p className="rounded-2xl border border-line p-3 text-center text-xs text-muted">
              Per installarla: tocca <b className="text-cream">Condividi</b> e poi{' '}
              <b className="text-cream">Aggiungi alla schermata Home</b>.
            </p>
          )}
        </div>

        <p className="label pt-2 text-center text-[10px]!">
          {image ? 'Pronto per il ricalco' : 'Consiglio: luminosità dello schermo al massimo'}
        </p>
      </main>

      {locked && <LockOverlay />}
      {calibrating && <Calibration onClose={() => setCalibrating(false)} />}
    </div>
  )
}
