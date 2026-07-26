'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'

const isCompatiblePersistedValue = <T,>(value: unknown, initialValue: T): value is T => {
  if (Array.isArray(initialValue)) return Array.isArray(value)
  if (initialValue === null) return value === null

  return typeof value === typeof initialValue
}

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const initialValueRef = useRef(initialValue)
  const [state, setState] = useState<T>(initialValue)
  const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false)

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(key)

      if (rawValue !== null) {
        const parsedValue = JSON.parse(rawValue) as unknown

        if (isCompatiblePersistedValue(parsedValue, initialValueRef.current)) {
          setState(parsedValue)
        } else {
          window.localStorage.removeItem(key)
          setState(initialValueRef.current)
        }
      }
    } catch {
      window.localStorage.removeItem(key)
      setState(initialValueRef.current)
    } finally {
      setHasLoadedPersistedState(true)
    }
  }, [key])

  useEffect(() => {
    if (!hasLoadedPersistedState) return

    try {
      const serializedValue = JSON.stringify(state)

      if (typeof serializedValue === 'string') {
        window.localStorage.setItem(key, serializedValue)
      }
    } catch {
      // Storage can be unavailable in private or restricted browsers.
    }
  }, [hasLoadedPersistedState, key, state])

  return [state, setState]
}
