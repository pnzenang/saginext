'use client'

import dynamic from 'next/dynamic'

import { TransactionHistoryPageSkeleton } from '@/components/global/PageLoadingSkeletons'
import type {
  AdminTransactionHistoryRow,
  AdminTransactionHistoryTotals
} from '@/components/global/AdminTransactionHistoryTable'

type AdminTransactionHistoryTableProps = {
  rows: AdminTransactionHistoryRow[]
  totals: AdminTransactionHistoryTotals
}

const AdminTransactionHistoryTable = dynamic(() => import('@/components/global/AdminTransactionHistoryTable'), {
  loading: () => <TransactionHistoryPageSkeleton />,
  ssr: false
})

const AdminTransactionHistoryTableClient = (props: AdminTransactionHistoryTableProps) => {
  return <AdminTransactionHistoryTable {...props} />
}

export default AdminTransactionHistoryTableClient
