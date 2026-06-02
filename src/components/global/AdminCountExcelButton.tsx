'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'

type AdminCountRow = {
  associationCode: string
  associationName: string
  vested: number
  pending: number
  awaitingPublication: number
  notInGoodStanding: number
  total: number
}

type AdminCountTotals = {
  vested: number
  pending: number
  awaitingPublication: number
  notInGoodStanding: number
  total: number
}

type AdminCountExcelButtonProps = {
  counts: AdminCountRow[]
  totals: AdminCountTotals
}

const AdminCountExcelButton = ({ counts, totals }: AdminCountExcelButtonProps) => {
  const exportToExcel = () => {
    const worksheetData = [
      ['Association Name', 'Association Code', 'Vested', 'Pending', 'Awaiting', 'Delinquent', 'Total'],
      ...counts.map(item => [
        item.associationName,
        item.associationCode,
        item.vested,
        item.pending,
        item.awaitingPublication,
        item.notInGoodStanding,
        item.total
      ]),
      ['Total', '', totals.vested, totals.pending, totals.awaitingPublication, totals.notInGoodStanding, totals.total]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = [{ wch: 34 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Count')
    XLSX.writeFile(workbook, `admin-count-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Button type='button' size='sm' onClick={exportToExcel} disabled={counts.length === 0} className='print:hidden'>
      <Download />
      Export Page
    </Button>
  )
}

export default AdminCountExcelButton
