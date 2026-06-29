'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { RemovedMemberType } from '@/utils/types'

type RemovedMembersDataTableProps = {
  data: RemovedMemberType[]
}

const RemovedMembersDataTable = dynamic(() => import('@/components/shadcn-studio/blocks/datatable-removedMembers'), {
  loading: () => <MemberTableSkeleton columnCount={8} filterCount={4} titleClassName='max-w-80' tone='red' />,
  ssr: false
})

const RemovedMembersDataTableClient = (props: RemovedMembersDataTableProps) => {
  return <RemovedMembersDataTable {...props} />
}

export default RemovedMembersDataTableClient
