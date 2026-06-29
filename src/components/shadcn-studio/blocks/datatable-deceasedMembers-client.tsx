'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { DeceasedMemberType } from '@/utils/types'

type DeceasedMembersDataTableProps = {
  data: DeceasedMemberType[]
}

const DeceasedMembersDataTable = dynamic(() => import('@/components/shadcn-studio/blocks/datatable-deceasedMembers'), {
  loading: () => (
    <MemberTableSkeleton
      columnCount={8}
      filterCount={4}
      showSummaryCards
      titleClassName='max-w-80'
      tone='purple'
    />
  ),
  ssr: false
})

const DeceasedMembersDataTableClient = (props: DeceasedMembersDataTableProps) => {
  return <DeceasedMembersDataTable {...props} />
}

export default DeceasedMembersDataTableClient
