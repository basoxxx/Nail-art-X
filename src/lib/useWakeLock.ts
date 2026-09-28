import { useEffect } from 'react'

/** Keeps the screen on while `active`; re-acquires after the tab becomes visible again. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const s = await navigator.wakeLock.request('screen')
        if (cancelled) s.release()
        else sentinel = s
      } catch {
        // Denied (battery saver, unsupported context): the app still works.
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      sentinel?.release()
    }
  }, [active])
}
