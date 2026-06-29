import { MemberTablePageSkeleton } from '@/components/global/PageLoadingSkeletons'

export default function AdminProfilesLoading() {
  return <MemberTablePageSkeleton titleClassName='max-w-md' columnCount={8} rowCount={8} />
}
