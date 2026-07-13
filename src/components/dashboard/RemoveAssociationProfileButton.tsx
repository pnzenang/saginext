'use client'

import { Trash2 } from 'lucide-react'

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
import { deleteAssociationProfileAction } from '@/utils/profile-actions'

type RemoveAssociationProfileButtonProps = {
  associationCode: string
  associationName: string
  profileId: string
}

const RemoveAssociationProfileButton = ({
  associationCode,
  associationName,
  profileId
}: RemoveAssociationProfileButtonProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40'
      >
        <Trash2 className='size-3.5' />
        Remove
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove association profile?</AlertDialogTitle>
        <AlertDialogDescription className='leading-6'>
          This removes the delegate profile for {associationCode} - {associationName}. Member, payment, transfer, and
          history records are not deleted. If any records still use this association code, SAGI will block the removal.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <FormContainer action={deleteAssociationProfileAction} className='w-full sm:w-auto'>
          <input type='hidden' name='profileId' value={profileId} />
          <SubmitButton
            text='Remove profile'
            className='h-9 w-full bg-red-700 px-4 text-sm normal-case hover:bg-red-800 sm:w-auto'
          />
        </FormContainer>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default RemoveAssociationProfileButton
