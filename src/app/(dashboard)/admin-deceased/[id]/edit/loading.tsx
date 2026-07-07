import { MemberFormPageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function IndexLoading() {
  return <MemberFormPageSkeleton fieldCount={10} showDescription={false} titleWidth='max-w-xl' tone='purple' />
}
