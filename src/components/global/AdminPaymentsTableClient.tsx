'use client'

import dynamic from 'next/dynamic'

import { AdminPaymentsTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { AdminPaymentRow, AdminPaymentTotals } from '@/components/global/AdminPaymentsTable'

type PaymentKind = 'contribution' | 'registration'

type AdminPaymentsTableProps = {
  adjustAction: (formData: FormData) => Promise<void>
  kind: PaymentKind
  rows: AdminPaymentRow[]
  sentAdjustmentAction?: (formData: FormData) => Promise<void>
  secondaryAction: (formData: FormData) => Promise<void>
  totals: AdminPaymentTotals
  verifyAction: (formData: FormData) => Promise<void>
}

const AdminPaymentsTable = dynamic(() => import('@/components/global/AdminPaymentsTable'), {
  loading: () => <AdminPaymentsTableSkeleton columnCount={8} />,
  ssr: false
})

const AdminPaymentsTableClient = (props: AdminPaymentsTableProps) => {
  return <AdminPaymentsTable {...props} />
}

export default AdminPaymentsTableClient
