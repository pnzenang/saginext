'use client'

import { useActionState, useEffect } from 'react'

import { Loader, WalletCards } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { actionFunction } from '@/utils/types'

type PaymentAmountFormCardProps = {
  action: actionFunction
  amountLabel: string
  description: string
  title: string
}

const initialState = {
  message: ''
}

const SubmitPaymentButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending} className='w-full sm:w-auto'>
      {pending ? (
        <>
          <Loader className='size-4 animate-spin' />
          Recording...
        </>
      ) : (
        <>
          <WalletCards className='size-4' />
          Record Payment
        </>
      )}
    </Button>
  )
}

const PaymentAmountFormCard = ({ action, amountLabel, description, title }: PaymentAmountFormCardProps) => {
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <Card className='mx-auto mb-5 max-w-4xl'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'>
          <div className='space-y-2'>
            <Label htmlFor='amountSent'>{amountLabel}</Label>
            <Input
              id='amountSent'
              name='amountSent'
              type='number'
              inputMode='decimal'
              min='0.01'
              step='0.01'
              placeholder='0.00'
              required
            />
          </div>
          <SubmitPaymentButton />
        </form>
      </CardContent>
    </Card>
  )
}

export default PaymentAmountFormCard
