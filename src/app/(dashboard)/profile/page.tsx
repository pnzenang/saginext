import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import { fetchProfile, updateProfileAction } from '@/utils/profile-actions'

const Profile = async () => {
  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex max-w-full min-w-0 flex-col overflow-hidden'>
      <h1 className='my-8 text-2xl font-semibold break-words capitalize md:text-4xl lg:text-5xl'>
        {' '}
        association/family/group profile
      </h1>
      <div className='border-primary bg-primary/15 max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8'>
        <FormContainer action={updateProfileAction}>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              type='text'
              name='associationName'
              label='Association Name'
              defaultValue={profile.associationName}
            />
            <FormInput
              type='text'
              name='associationCode'
              label='Association Code'
              defaultValue={profile.associationCode}
            />
          </div>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='firstDelegateFullName'
              label='First Delegate Name'
              defaultValue={profile.firstDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='firstDelegatePhoneNumber'
              label='First Delegate Phone Number'
              defaultValue={profile.firstDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='firstDelegateEmail'
              label='First Delegate Email'
              defaultValue={profile.firstDelegateEmail}
            />
          </div>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='secondDelegateFullName'
              label='Second Delegate Name'
              defaultValue={profile.secondDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='secondDelegatePhoneNumber'
              label='Second Delegate Phone Number'
              defaultValue={profile.secondDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='secondDelegateEmail'
              label='Second Delegate Email'
              defaultValue={profile.secondDelegateEmail}
            />
          </div>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='thirdDelegateFullName'
              label='Board Member Name'
              defaultValue={profile.thirdDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label='Board Member Phone Number'
              defaultValue={profile.thirdDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='thirdDelegateEmail'
              label='Board Member Email'
              defaultValue={profile.thirdDelegateEmail}
            />
          </div>
          <div className='mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3'>
            <SubmitButton text='Update Profile' className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default Profile
