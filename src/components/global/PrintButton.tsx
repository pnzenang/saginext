'use client'

import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'

const PrintButton = () => {
  return (
    <Button type='button' size='sm' onClick={() => window.print()} className='print:hidden'>
      <Printer />
      Print
    </Button>
  )
}

export default PrintButton
