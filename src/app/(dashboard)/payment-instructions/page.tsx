import { CreditCard } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PaymentInstructions = () => {
  return (
    <section className='mx-auto flex w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8'>
      <Card className='w-full'>
        <CardHeader>
          <Badge className='w-fit' variant='secondary'>
            Payment
          </Badge>
          <CardTitle className='flex items-center gap-2 text-2xl'>
            <CreditCard className='text-primary size-6' />
            Payment instruction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm leading-6 sm:text-base'>
            Payment instruction content will be added here soon.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

export default PaymentInstructions
