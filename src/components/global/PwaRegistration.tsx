'use client'

import { useEffect } from 'react'

const serviceWorkerPath = '/sw.js'

export const PwaRegistration = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return

    let isMounted = true

    const registerServiceWorker = () => {
      if (!isMounted) return

      navigator.serviceWorker.register(serviceWorkerPath).catch(() => undefined)
    }

    if (document.readyState === 'complete') {
      registerServiceWorker()
    } else {
      window.addEventListener('load', registerServiceWorker, { once: true })
    }

    return () => {
      isMounted = false
      window.removeEventListener('load', registerServiceWorker)
    }
  }, [])

  return null
}
