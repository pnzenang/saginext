import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormInputProps = {
  name: string;
  type: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  readonly?: boolean;
};

const FormInput = (props: FormInputProps) => {
  const { label, name, type, defaultValue, placeholder, value } = props;
  return (
    <div className='mb-2 '>
      <Label htmlFor={name} className='py-2 capitalize text-muted-foreground'>
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        className='py-2 uppercase'
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        required
        readOnly={value ? true : false}
      />
    </div>
  );
};
export default FormInput;
