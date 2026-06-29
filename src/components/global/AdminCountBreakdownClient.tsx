'use client'

import dynamic from 'next/dynamic'

import { AdminCountPageSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { AdminCountRow, AdminCountTotals } from '@/components/global/AdminCountBreakdown'

type AdminCountBreakdownProps = {
  counts: AdminCountRow[]
  totals: AdminCountTotals
}

const AdminCountBreakdown = dynamic(() => import('@/components/global/AdminCountBreakdown'), {
  loading: () => <AdminCountPageSkeleton />,
  ssr: false
})

const AdminCountBreakdownClient = (props: AdminCountBreakdownProps) => {
  return <AdminCountBreakdown {...props} />
}

export default AdminCountBreakdownClient
