'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { RemovedMemberType } from '@/utils/types'

type RemovedMembersDataTableProps = {
  data: RemovedMemberType[]
}

const RemovedMembersDataTable = dynamic(() => import('@/components/shadcn-studio/blocks/database-adminAllRemoved'), {
  loading: () => <MemberTableSkeleton columnCount={8} filterCount={4} titleClassName='max-w-lg' tone='red' />,
  ssr: false
})

const AdminRemovedMembersDataTableClient = (props: RemovedMembersDataTableProps) => {
  return <RemovedMembersDataTable {...props} />
}

export default AdminRemovedMembersDataTableClient
