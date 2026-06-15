import type { Cell } from '@tanstack/react-table'

export const getTableCellLabel = <TData, TValue>(cell: Cell<TData, TValue>) => {
  const header = cell.column.columnDef.header

  return typeof header === 'string' ? header : cell.column.id
}
