'use client';
import { useToast } from '../ui/use-toast';
import { useEffect } from 'react';
import { actionFunction } from '@/utils/types';
import { useFormState } from 'react-dom';

const initialState = {
  message: '',
};

const FormContainer = ({
  action,
  children,
}: {
  action: actionFunction;
  children: React.ReactNode;
}) => {
  const { toast } = useToast();
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.message) {
      // toast(state.message);
      toast({ description: state.message });
    }
  }, [state]);

  return <form action={formAction}>{children}</form>;
};
export default FormContainer;
