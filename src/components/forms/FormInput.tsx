import type { ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps = {
  name: string
  type: string
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  readOnly?: boolean
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
    type,
    value
  } = props

  return (
    <div className='mb-2 min-w-0'>
      <Label htmlFor={name} className='mb-1 break-words capitalize'>
        {label || name}
      </Label>
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
        className='border-primary border uppercase'
      />
    </div>
  )
}

export default FormInput
