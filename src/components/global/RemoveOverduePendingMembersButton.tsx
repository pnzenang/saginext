'use client'

import { useActionState, useEffect } from 'react'

import { useFormStatus } from 'react-dom'

import { AlertTriangle, Loader, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
import type { AppLanguage } from '@/lib/i18n'
import { removeOverduePendingMembersAction } from '@/utils/actions'
import { registrationPaymentDeadlineDays } from '@/utils/registration-payment-deadline'

type RemoveOverduePendingMembersButtonProps = {
  language?: AppLanguage
  memberIds: string[]
  onRemoved?: () => void
  overdueCount: number
}

const removeOverdueCopy = {
  en: {
    button: (count: number) => `Remove Overdue Reg.(${count} Overdue(s))`,
    cancel: 'Cancel',
    description: (count: number) =>
      `This will move ${count} selected overdue pending member${count === 1 ? '' : 's'} past the ${registrationPaymentDeadlineDays}-day registration fee deadline to Removed Members and delete the active member record. If this is a mistake, the member can be restored from Removed Members within 48 hours.`,
    pending: 'Removing...',
    submit: 'Remove',
    title: 'Remove selected overdue registration members?'
  },
  fr: {
    button: (count: number) => `Retirer inscriptions en retard (${count} sélectionné${count === 1 ? '' : 's'})`,
    cancel: 'Annuler',
    description: (count: number) =>
      `Cette action déplacera ${count} membre${count === 1 ? '' : 's'} en attente sélectionné${count === 1 ? '' : 's'} ayant dépassé le délai de ${registrationPaymentDeadlineDays} jours pour les frais d'inscription vers les membres retirés et supprimera son dossier actif. En cas d'erreur, le membre peut être restauré depuis les membres retirés dans les 48 heures.`,
    pending: 'Suppression...',
    submit: 'Retirer',
    title: 'Retirer les inscriptions en retard sélectionnées ?'
  }
} as const

const RemoveOverduePendingMembersButton = ({
  language = 'en',
  memberIds,
  onRemoved,
  overdueCount
}: RemoveOverduePendingMembersButtonProps) => {
  const router = useRouter()
  const copy = removeOverdueCopy[language]

  const [state, formAction] = useActionState(removeOverduePendingMembersAction, {
    message: ''
  })

  useEffect(() => {
    if (!state.message) return

    toast(state.message)
    onRemoved?.()
    router.refresh()
  }, [onRemoved, router, state.message])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' className='w-full sm:w-auto' disabled={overdueCount === 0}>
          <Trash2 />
          {copy.button(overdueCount)}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='text-destructive size-5' aria-hidden='true' />
            {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription>{copy.description(overdueCount)}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
          {memberIds.map(memberId => (
            <input key={memberId} type='hidden' name='memberIds' value={memberId} />
          ))}
          <AlertDialogFooter>
            <AlertDialogCancel type='button'>{copy.cancel}</AlertDialogCancel>
            <RemoveOverduePendingSubmitButton copy={copy} disabled={overdueCount === 0} />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const RemoveOverduePendingSubmitButton = ({
  copy,
  disabled
}: {
  copy: (typeof removeOverdueCopy)[AppLanguage]
  disabled: boolean
}) => {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={disabled || pending} className='bg-destructive hover:bg-destructive/90 text-white'>
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.submit
      )}
    </Button>
  )
}

export default RemoveOverduePendingMembersButton
