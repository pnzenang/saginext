'use client'

import dynamic from 'next/dynamic'
import { toast } from 'sonner'

import { AdminPaymentsTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { AdminPaymentRow, AdminPaymentTotals } from '@/components/global/AdminPaymentsTable'

type PaymentKind = 'contribution' | 'registration'

type AdminPaymentAction = (formData: FormData) => Promise<{ message: string } | void>

type AdminPaymentsTableProps = {
  adjustAction: AdminPaymentAction
  kind: PaymentKind
  paymentCodeAction?: AdminPaymentAction
  rows: AdminPaymentRow[]
  sentAdjustmentAction?: AdminPaymentAction
  secondaryAction: AdminPaymentAction
  totals: AdminPaymentTotals
  verifyAction: AdminPaymentAction
}

const AdminPaymentsTable = dynamic(() => import('@/components/global/AdminPaymentsTable'), {
  loading: () => <AdminPaymentsTableSkeleton columnCount={10} />,
  ssr: false
})

// Server actions report failures by returning { message }; surface them so a failed click isn't silent.
const withErrorToast =
  (action: AdminPaymentAction) =>
  async (formData: FormData): Promise<void> => {
    const result = await action(formData)

    if (result?.message) toast.error(result.message)
  }

const AdminPaymentsTableClient = ({
  adjustAction,
  paymentCodeAction,
  secondaryAction,
  sentAdjustmentAction,
  verifyAction,
  ...props
}: AdminPaymentsTableProps) => {
  return (
    <AdminPaymentsTable
      {...props}
      adjustAction={withErrorToast(adjustAction)}
      paymentCodeAction={paymentCodeAction && withErrorToast(paymentCodeAction)}
      secondaryAction={withErrorToast(secondaryAction)}
      sentAdjustmentAction={sentAdjustmentAction && withErrorToast(sentAdjustmentAction)}
      verifyAction={withErrorToast(verifyAction)}
    />
  )
}

export default AdminPaymentsTableClient
