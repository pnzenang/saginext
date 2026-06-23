import { currentUser } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import { createProfileAction } from '@/utils/profile-actions'

const CreateProfilePage = async () => {
  const user = await currentUser()

  if (user?.privateMetadata?.hasProfile) redirect('/all-members')

  return (
    <section className='flex w-full min-w-0 flex-col overflow-hidden py-8 sm:py-10'>
      <h1 className='mb-6 text-2xl leading-tight font-semibold break-words capitalize md:text-4xl lg:text-5xl'>
        create association profile
      </h1>
      <div className='border-primary bg-muted w-full max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8'>
        <FormContainer action={createProfileAction}>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2'>
            <FormInput type='text' name='associationName' label='Association Name' />
            <FormInput type='text' name='associationCode' label='Association Code' />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='firstDelegateFullName' label='First Delegate Name' />
            <MaskPhoneInput
              type='text'
              name='firstDelegatePhoneNumber'
              label='First Delegate Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='firstDelegateEmail' label='First Delegate Email' />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='secondDelegateFullName' label='Second Delegate Name' />
            <MaskPhoneInput
              type='text'
              name='secondDelegatePhoneNumber'
              label='First Delegate Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='secondDelegateEmail' label='Second Delegate Email' />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='thirdDelegateFullName' label='Board Member Name' />
            <MaskPhoneInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label='Board Member Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='thirdDelegateEmail' label='Board Member Email' />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <SubmitButton text='Create Profile' className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default CreateProfilePage
