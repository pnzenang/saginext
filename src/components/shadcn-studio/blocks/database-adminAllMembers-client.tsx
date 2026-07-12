'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { AppLanguage } from '@/lib/i18n'
import type { MemberType } from '@/utils/types'

type MembersDataTableProps = {
  data: MemberType[]
  language?: AppLanguage
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
