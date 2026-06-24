import { MemberFormPageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function IndexLoading() {
  return <MemberFormPageSkeleton fieldCount={9} showIcon titleWidth='max-w-md' tone='red' />
}
