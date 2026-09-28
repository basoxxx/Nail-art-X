import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clampPxPerMm, estimatePxPerMm } from './calibration'
import type { NailShape } from './nailShapes'

export type Background = 'white' | 'black'

export interface DesignImage {
  url: string
  name: string
  naturalWidth: number
  naturalHeight: number
}

export interface DesignTransform {
  /** Offset of the image centre from the stage centre, in mm (survives recalibration). */
  xMm: number
  yMm: number
  /** Real-world width of the design on screen, in mm. Height follows the aspect ratio. */
  widthMm: number
  rotation: number
  flipX: boolean
  flipY: boolean
  opacity: number
}

export interface Guide {
  visible: boolean
  shape: NailShape
  widthMm: number
  lengthMm: number
  opacity: number
  rotation: number
  color: string
}

interface State {
  // Calibration (persisted)
  pxPerMm: number
  calibrated: boolean
  tipWidthMm: number

  image: DesignImage | null
  transform: DesignTransform
  guide: Guide
  background: Background
  showRuler: boolean
  locked: boolean

  setPxPerMm: (v: number, calibrated?: boolean) => void
  setTipWidthMm: (v: number) => void
  setImage: (img: DesignImage | null) => void
  updateTransform: (patch: Partial<DesignTransform>) => void
  resetTransform: () => void
  updateGuide: (patch: Partial<Guide>) => void
  setBackground: (b: Background) => void
  setShowRuler: (v: boolean) => void
  setLocked: (v: boolean) => void
}

export const WIDTH_MM_MIN = 3
export const WIDTH_MM_MAX = 200

const defaultTransform = (widthMm = 14): DesignTransform => ({
  xMm: 0,
  yMm: 0,
  widthMm,
  rotation: 0,
  flipX: false,
  flipY: false,
  opacity: 1,
})

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      pxPerMm: estimatePxPerMm(),
      calibrated: false,
      tipWidthMm: 14,

      image: null,
      transform: defaultTransform(),
      guide: {
        visible: true,
        shape: 'almond',
        widthMm: 14,
        lengthMm: 24,
        opacity: 0.8,
        rotation: 0,
        color: '#ec4899',
      },
      background: 'white',
      showRuler: false,
      locked: false,

      setPxPerMm: (v, calibrated) =>
        set((s) => ({ pxPerMm: clampPxPerMm(v), calibrated: calibrated ?? s.calibrated })),
      setTipWidthMm: (v) => set({ tipWidthMm: v }),
      setImage: (img) => {
        const prev = get().image
        if (prev && prev.url !== img?.url) URL.revokeObjectURL(prev.url)
        // New designs start at the guide's width so they're immediately in scale.
        set({ image: img, transform: defaultTransform(get().guide.widthMm) })
      },
      updateTransform: (patch) =>
        set((s) => {
          const t = { ...s.transform, ...patch }
          t.widthMm = Math.min(WIDTH_MM_MAX, Math.max(WIDTH_MM_MIN, t.widthMm))
          t.rotation = normalizeAngle(t.rotation)
          t.opacity = Math.min(1, Math.max(0.05, t.opacity))
          return { transform: t }
        }),
      resetTransform: () => set((s) => ({ transform: defaultTransform(s.guide.widthMm) })),
      updateGuide: (patch) => set((s) => ({ guide: { ...s.guide, ...patch } })),
      setBackground: (background) => set({ background }),
      setShowRuler: (showRuler) => set({ showRuler }),
      setLocked: (locked) => set({ locked }),
    }),
    {
      name: 'nail-art-x',
      version: 1,
      partialize: (s) => ({
        pxPerMm: s.pxPerMm,
        calibrated: s.calibrated,
        tipWidthMm: s.tipWidthMm,
        guide: s.guide,
        background: s.background,
        showRuler: s.showRuler,
      }),
    },
  ),
)

/** Wraps any angle into (-180, 180]. */
export function normalizeAngle(deg: number): number {
  const a = ((deg % 360) + 360) % 360
  return a > 180 ? a - 360 : a
}
