'use client'

import { RotateCcw } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { resetTransactionHistoryAction } from '@/utils/actions'

type ResetTransactionHistoryButtonProps = {
  transactionCount: number
}

const ResetTransactionHistoryButton = ({ transactionCount }: ResetTransactionHistoryButtonProps) => {
  const disabled = transactionCount === 0

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={disabled}
          className='h-10 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40'
        >
          <RotateCcw className='size-4' />
          Reset History
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset transaction history?</AlertDialogTitle>
          <AlertDialogDescription className='leading-6'>
            This clears the visible transaction history entries for submitted, verified, adjusted, and reset payments.
            Current payment records and contribution due offsets are not deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <FormContainer action={resetTransactionHistoryAction} className='w-full sm:w-auto'>
            <SubmitButton
              text='Reset history'
              className='h-9 w-full bg-red-700 px-4 text-sm normal-case hover:bg-red-800 sm:w-auto'
            />
          </FormContainer>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ResetTransactionHistoryButton
