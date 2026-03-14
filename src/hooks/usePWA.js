import { useEffect } from 'react'

export function usePWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => console.log('[Inkwell] SW registered:', reg.scope))
          .catch(err => console.warn('[Inkwell] SW failed:', err))
      })
    }
  }, [])
}
