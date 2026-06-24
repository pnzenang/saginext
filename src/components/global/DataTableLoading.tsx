import { MemberTableSkeleton } from '@/components/global/PageLoadingSkeletons'

interface DataTableLoadingProps {
  columnCount: number
  rowCount?: number
}

const DataTableLoading = ({ columnCount, rowCount = 8 }: DataTableLoadingProps) => {
  return <MemberTableSkeleton columnCount={columnCount} rowCount={rowCount} />
}

export default DataTableLoading
