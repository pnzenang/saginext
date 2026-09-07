'use client'

import { useCallback, useEffect, useRef, useState, type ComponentProps, type PointerEvent } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type FormInputProps = {
  name: string
  type: string
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  readOnly?: boolean
  truncateLabel?: boolean
} & Pick<ComponentProps<'input'>, 'autoComplete' | 'inputMode' | 'maxLength' | 'pattern' | 'title'>

const FormInput = (props: FormInputProps) => {
  const {
    autoComplete,
    defaultValue,
    inputMode,
    label,
    maxLength,
    name,
    pattern,
    placeholder,
    readOnly,
    title,
    truncateLabel,
    type,
    value
  } = props

  const displayLabel = label || name
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLabelTooltipOpen, setIsLabelTooltipOpen] = useState(false)

  const clearCloseTimer = useCallback(() => {
    if (!closeTimerRef.current) return

    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const showLabelTooltip = useCallback(() => {
    if (!truncateLabel) return

    clearCloseTimer()
    setIsLabelTooltipOpen(true)
  }, [clearCloseTimer, truncateLabel])

  const hideLabelTooltip = useCallback(() => {
    if (!truncateLabel) return

    clearCloseTimer()
    setIsLabelTooltipOpen(false)
  }, [clearCloseTimer, truncateLabel])

  const handleLabelPointerDown = (event: PointerEvent<HTMLLabelElement>) => {
    if (event.pointerType !== 'touch') return

    showLabelTooltip()
    closeTimerRef.current = setTimeout(() => {
      setIsLabelTooltipOpen(false)
      closeTimerRef.current = null
    }, 3500)
  }

  useEffect(() => clearCloseTimer, [clearCloseTimer])

  const labelElement = (
    <Label
      htmlFor={name}
      tabIndex={truncateLabel ? 0 : undefined}
      aria-label={truncateLabel ? displayLabel : undefined}
      onFocus={showLabelTooltip}
      onBlur={hideLabelTooltip}
      onPointerDown={truncateLabel ? handleLabelPointerDown : undefined}
      className={
        truncateLabel
          ? 'mb-1 block max-w-full cursor-help truncate whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          : 'mb-1 break-words capitalize'
      }
    >
      {displayLabel}
    </Label>
  )

  return (
    <div className='mb-2 min-w-0'>
      {truncateLabel ? (
        <Tooltip open={isLabelTooltipOpen} onOpenChange={setIsLabelTooltipOpen}>
          <TooltipTrigger asChild>{labelElement}</TooltipTrigger>
          <TooltipContent
            align='start'
            side='top'
            sideOffset={4}
            className='max-w-[min(22rem,calc(100vw-2rem))] whitespace-normal text-left leading-5'
          >
            {displayLabel}
          </TooltipContent>
        </Tooltip>
      ) : (
        labelElement
      )}
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        pattern={pattern}
        required
        readOnly={readOnly}
        title={title}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onFocus={showLabelTooltip}
        onBlur={hideLabelTooltip}
        className='border-primary read-only:bg-muted read-only:text-muted-foreground read-only:cursor-not-allowed border uppercase'
      />
    </div>
  )
}

export default FormInput
