/* eslint-disable @typescript-eslint/no-explicit-any */
import SubmitButton from '@/components/form/Buttons'
import FormContainer from '@/components/form/FormContainer'
import FormInput from '@/components/form/FormInput'
import { createProfileAction } from '@/utils/actions'
import { currentUser } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

const CreateProfilePage = async () => {
  const user = await currentUser()
  if (user?.privateMetadata?.hasProfile) redirect('/')
  return (
    <section className='border-4 border-primary rounded-lg mt-48'>
      <h1 className='sm:text-4xl font-semibold mb-2 capitalize p-10 text-primary'>
        Create Your Association Profile
        <span className='text-xs text-primary block mt-2'>
          <br />
          Here, you need to enter your association name and pick a 4-letter code
          to identify your association. If an error occurs, choose another one,
          you should also enter the delegates information.
        </span>
      </h1>

      <div className='border p-8 rounded-md '>
        <FormContainer action={createProfileAction}>
          <div className='grid md:grid-cols-2 gap-4 mt-4'>
            <FormInput
              type='text'
              name='associationName'
              label='Association Name'
            />
            <FormInput
              type='text'
              name='associationCode'
              label='Association Code'
            />
          </div>
          <div className='grid md:grid-cols-3 gap-4 mt-4'>
            <FormInput
              type='text'
              name='firstDelegateName'
              label='First Delegate Full Name'
            />
            <FormInput
              type='text'
              name='firstDelegateEmail'
              label='First Delegate Email'
            />
            <FormInput
              type='text'
              name='firstDelegatePhoneNumber'
              label='First Delegate Phone Number'
            />
            <FormInput
              type='text'
              name='secondDelegateName'
              label='Second Delegate Full Name'
            />
            <FormInput
              type='text'
              name='secondDelegateEmail'
              label='Second Delegate Email'
            />
            <FormInput
              type='text'
              name='secondDelegatePhoneNumber'
              label='Second Delegate Phone Number'
            />
            <FormInput
              type='text'
              name='thirdDelegateName'
              label='Third Delegate Full Name'
            />
            <FormInput
              type='text'
              name='thirdDelegateEmail'
              label='Third Delegate Email'
            />
            <FormInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label='Third Delegate Phone Number'
            />
            <SubmitButton text='Create Profile' className='mt-8 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}
export default CreateProfilePage
