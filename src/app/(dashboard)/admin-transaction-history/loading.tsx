import DataTableLoading from '@/components/global/DataTableLoading'
import { Shell } from '@/components/global/Shell'

export default function Loading() {
  return (
    <Shell>
      <DataTableLoading columnCount={6} />
    </Shell>
  )
}
