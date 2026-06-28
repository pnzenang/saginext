'use client'

import { useActionState, useEffect, useRef, type FormHTMLAttributes, type ReactNode } from 'react'

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
  encType
}: {
  action: actionFunction
  children: ReactNode
  className?: string
  encType?: FormHTMLAttributes<HTMLFormElement>['encType']
}) => {
  const wasPendingRef = useRef(false)
  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (isPending) {
      wasPendingRef.current = true

      return
    }

    if (!wasPendingRef.current || !state.message) return

    wasPendingRef.current = false
    toast(state.message)
  }, [isPending, state.message])

  return (
    <form action={formAction} className={cn('w-full max-w-full min-w-0', className)} encType={encType}>
      {children}
    </form>
  )
}

export default FormContainer
