import { useRef, useState, type ChangeEvent } from 'react'
import { useStore } from './lib/store'
import { useWakeLock } from './lib/useWakeLock'
import { Stage } from './components/Stage'
import { ControlPanel } from './components/ControlPanel'
import { Calibration } from './components/Calibration'
import { LockOverlay } from './components/LockOverlay'
import { Btn, icons } from './components/ui'

export default function App() {
  const { image, locked, calibrated, background, showRuler, setImage, setLocked, setBackground, setShowRuler } = useStore()
  const [calibrating, setCalibrating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const enteredFullscreen = useRef(false)

  useWakeLock(!!image || locked)

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImage({ url, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  const lock = async () => {
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
    <div className="relative h-full w-full">
      <Stage />

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {!locked && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          <header className="pointer-events-auto flex items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
            <Btn onClick={() => fileRef.current?.click()} label="Carica design" className="shadow-lg">
              {icons.image}
              <span className="hidden min-[380px]:inline">Carica</span>
            </Btn>
            <div className="flex-1" />
            <Btn
              onClick={() => setBackground(background === 'white' ? 'black' : 'white')}
              label={background === 'white' ? 'Sfondo nero' : 'Sfondo bianco'}
              className="shadow-lg"
            >
              {background === 'white' ? icons.moon : icons.sun}
            </Btn>
            <Btn onClick={() => setShowRuler(!showRuler)} active={showRuler} label="Righello" className="shadow-lg">
              {icons.ruler}
            </Btn>
            <Btn onClick={lock} label="Blocca" active className="shadow-lg">
              {icons.lock}
              <span>Blocca</span>
            </Btn>
          </header>

          {!image && <EmptyState calibrated={calibrated} onLoad={() => fileRef.current?.click()} onCalibrate={() => setCalibrating(true)} />}

          <ControlPanel onCalibrate={() => setCalibrating(true)} />
        </div>
      )}

      {locked && <LockOverlay onUnlock={unlock} />}
      {calibrating && <Calibration onClose={() => setCalibrating(false)} />}
    </div>
  )
}

function EmptyState({ calibrated, onLoad, onCalibrate }: { calibrated: boolean; onLoad: () => void; onCalibrate: () => void }) {
  return (
    <div className="pointer-events-auto mx-auto w-[min(22rem,calc(100%-2rem))] space-y-3 rounded-3xl bg-gray-900/90 p-5 text-center shadow-2xl">
      <h1 className="text-xl font-bold">Nail Art X</h1>
      <p className="text-sm text-gray-300">Lightbox digitale per ricalcare i design in scala reale.</p>
      {!calibrated && (
        <Btn onClick={onCalibrate} className="w-full">
          {icons.target} 1. Calibra la scala con una tip
        </Btn>
      )}
      <Btn onClick={onLoad} active className="w-full">
        {icons.image} {calibrated ? 'Carica un design' : '2. Carica un design'}
      </Btn>
      <p className="text-[11px] text-gray-500">Consiglio: porta la luminosità dello schermo al massimo.</p>
    </div>
  )
}
