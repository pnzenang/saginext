'use client'

import { useActionState, useEffect } from 'react'

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
  children: React.ReactNode
  className?: string
}) => {
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className={cn('w-full max-w-full min-w-0', className)}>
      {children}
    </form>
  )
}

export default FormContainer
