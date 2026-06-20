'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import type { ColumnFiltersState } from '@tanstack/react-table'

const isColumnFiltersState = (value: unknown): value is ColumnFiltersState =>
  Array.isArray(value) &&
  value.every(filter => {
    if (!filter || typeof filter !== 'object') return false

    return typeof (filter as { id?: unknown }).id === 'string'
  })

export const usePersistentColumnFilters = (
  storageKey: string
): [ColumnFiltersState, Dispatch<SetStateAction<ColumnFiltersState>>] => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [hasLoadedStoredFilters, setHasLoadedStoredFilters] = useState(false)

  useEffect(() => {
    try {
      const storedFilters = window.localStorage.getItem(storageKey)

      if (storedFilters) {
        const parsedFilters = JSON.parse(storedFilters) as unknown

        if (isColumnFiltersState(parsedFilters)) {
          setColumnFilters(parsedFilters)
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey)
    } finally {
      setHasLoadedStoredFilters(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hasLoadedStoredFilters) return

    if (columnFilters.length === 0) {
      window.localStorage.removeItem(storageKey)

      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(columnFilters))
  }, [columnFilters, hasLoadedStoredFilters, storageKey])

  return [columnFilters, setColumnFilters]
}
