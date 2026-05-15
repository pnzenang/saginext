import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps = {
  name: string
  type: string
  items: string[]
  label?: string
  defaultValue?: string
  value?: string
  readOnly?: boolean
  placeholder?: string
}

const FormInput = (props: FormInputProps) => {
  const { label, name, defaultValue, type, placeholder } = props

  return (
    <div className='mb-2'>
      <Label htmlFor={name} className='mb-1 capitalize'>
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className='border-primary border uppercase'
      />
    </div>
  )
}

export default FormInput
