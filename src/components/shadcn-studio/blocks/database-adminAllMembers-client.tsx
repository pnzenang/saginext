'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { MemberType } from '@/utils/types'

type MembersDataTableProps = {
  data: MemberType[]
}

const MembersDataTable = dynamic(() => import('@/components/shadcn-studio/blocks/database-adminAllMembers'), {
  loading: () => (
    <MemberTableSkeleton columnCount={8} filterCount={4} showExportPage showSummaryCards titleClassName='max-w-xl' />
  ),
  ssr: false
})

const AdminMembersDataTableClient = (props: MembersDataTableProps) => {
  return <MembersDataTable {...props} />
}

export default AdminMembersDataTableClient
