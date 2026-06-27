'use client'

import { useActionState, useEffect, type FormHTMLAttributes, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import type { actionFunction } from '@/utils/types'

const initialState = {
  message: ''
}

const FormContainer = ({
  action,
  children,
  className,
  encType,
  refreshOnMessage = false
}: {
  action: actionFunction
  children: ReactNode
  className?: string
  encType?: FormHTMLAttributes<HTMLFormElement>['encType']
  refreshOnMessage?: boolean
}) => {
  const router = useRouter()
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)

      if (refreshOnMessage) {
        router.refresh()
      }
    }
  }, [refreshOnMessage, router, state])

  return (
    <form action={formAction} className={cn('w-full max-w-full min-w-0', className)} encType={encType}>
      {children}
    </form>
  )
}

export default FormContainer
