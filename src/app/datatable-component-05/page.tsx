import { Card } from '@/components/ui/card'
invoiceData
import InvoiceDatatable, { type Item } from '@/components/shadcn-studio/blocks/datatable-invoice'
import { invoiceData } from '@/utils/funeralHomes'

const DataTablePreview = () => {
  return (
    <div className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <Card className='mx-auto w-full max-w-275 py-0'>
          <InvoiceDatatable data={invoiceData} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
