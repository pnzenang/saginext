'use client';
import { useFormStatus } from 'react-dom';
import { LuLoader } from 'react-icons/lu';
import { Button } from '../ui/button';

type SubmitButtonProps = {
  className?: string;
  text?: string;
};

const SubmitButton = ({
  className = '',
  text = 'submit',
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type='submit'
      disabled={pending}
      className={`capitalize ${className}`}
      size='lg'
    >
      {pending ? (
        <>
          <LuLoader className='mr-2 h-6 w-6 animate-spin' />
          Please wait...
        </>
      ) : (
        text
      )}
    </Button>
  );
};
export default SubmitButton;
