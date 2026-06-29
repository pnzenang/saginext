'use client'

import { useActionState, useEffect, useRef, type ReactNode } from 'react'

import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import type { actionFunction } from '@/utils/types'

const initialState = {
  message: ''
}

const FormContainer = ({
  action,
  children,
  className
}: {
  action: actionFunction
  children: ReactNode
  className?: string
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
    <form action={formAction} className={cn('w-full max-w-full min-w-0', className)}>
      {children}
    </form>
  )
}

export default FormContainer
