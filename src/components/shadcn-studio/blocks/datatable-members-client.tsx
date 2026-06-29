'use client'

import dynamic from 'next/dynamic'

import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'
import type { AssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import type { AssociationRegistrationSummary } from '@/utils/sagi-registration-summary'
import type { MemberType } from '@/utils/types'

type MembersDataTableProps = {
  currentContribution: AssociationContributionSummary
  currentRegistrationPayment: AssociationRegistrationSummary
  data: MemberType[]
}

const MembersDataTable = dynamic(() => import('@/components/shadcn-studio/blocks/datatable-members'), {
  loading: () => (
    <MemberTableSkeleton
      columnCount={8}
      filterCount={4}
      showExportPage
      showPaymentCards
      showSummaryCards
      titleClassName='max-w-96'
    />
  ),
  ssr: false
})

const MembersDataTableClient = (props: MembersDataTableProps) => {
  return <MembersDataTable {...props} />
}

export default MembersDataTableClient
