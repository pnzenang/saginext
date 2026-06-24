import { MemberTablePageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function IndexLoading() {
  return (
    <MemberTablePageSkeleton
      columnCount={8}
      filterCount={4}
      showExportPage
      showPaymentCards
      showSummaryCards
      titleClassName='max-w-96'
    />
  )
}
