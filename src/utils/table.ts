import type { Cell } from '@tanstack/react-table'

export const getTableCellLabel = <TData, TValue>(cell: Cell<TData, TValue>) => {
  const header = cell.column.columnDef.header

  return typeof header === 'string' ? header : cell.column.id
}

const nonTextTooltipColumnIds = new Set(['actions', 'id', 'registrationPaymentWarning', 'select'])

export const getTableCellTitle = <TData, TValue>(cell: Cell<TData, TValue>) => {
  if (nonTextTooltipColumnIds.has(cell.column.id)) return undefined

  const value = cell.getValue()

  if (value instanceof Date) return value.toLocaleString()

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const title = String(value).trim()

    return title || undefined
  }

  return undefined
}
