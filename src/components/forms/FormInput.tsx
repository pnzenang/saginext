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
}

const FormInput = (props: FormInputProps) => {
  const { label, type, name, defaultValue, placeholder, value, readOnly } = props

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
        required
        readOnly={readOnly}
        className='border-primary border uppercase'
      />
    </div>
  )
}

export default FormInput
