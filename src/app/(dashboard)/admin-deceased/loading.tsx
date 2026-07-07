import { MemberTablePageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function IndexLoading() {
  return (
    <MemberTablePageSkeleton
      columnCount={8}
      filterCount={4}
      showSummaryCards
      titleClassName='max-w-lg'
      tone='purple'
    />
  )
}
