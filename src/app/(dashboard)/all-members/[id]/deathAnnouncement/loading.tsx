import { MemberFormPageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function IndexLoading() {
  return <MemberFormPageSkeleton fieldCount={10} showIcon titleWidth='max-w-xl' tone='purple' />
}
