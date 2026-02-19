import SubmitButton from '@/components/form/Buttons'
import FormContainer from '@/components/form/FormContainer'
import FormInput from '@/components/form/FormInput'
import { updateProfileAction, fetchProfile } from '@/utils/actions'

const Profile = async () => {
  const profile = await fetchProfile()
  return (
    <section className='border-4 border-primary rounded-lg mt-48'>
      <h1 className='sm:text-4xl font-semibold mb-2 capitalize p-10 text-primary'>
        association profile
      </h1>
      <div className='border p-8 rounded-md '>
        <FormContainer action={updateProfileAction}>
          <div className='grid md:grid-cols-2 gap-4 mt-4'>
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
          <div className='grid md:grid-cols-3 gap-4 mt-4'>
            <FormInput
              type='text'
              name='firstDelegateName'
              label='First Delegate Full Name'
              defaultValue={profile.firstDelegateName}
            />
            <FormInput
              type='text'
              name='firstDelegateEmail'
              label='First Delegate Email'
              defaultValue={profile.firstDelegateEmail}
            />
            <FormInput
              type='text'
              name='firstDelegatePhoneNumber'
              label='First Delegate Phone Number'
              defaultValue={profile.firstDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='secondDelegateName'
              label='Second Delegate Full Name'
              defaultValue={profile.secondDelegateName}
            />
            <FormInput
              type='text'
              name='secondDelegateEmail'
              label='Second Delegate Email'
              defaultValue={profile.secondDelegateEmail}
            />
            <FormInput
              type='text'
              name='secondDelegatePhoneNumber'
              label='Second Delegate Phone Number'
              defaultValue={profile.secondDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='thirdDelegateName'
              label='Third Delegate Full Name'
              defaultValue={profile.thirdDelegateName}
            />
            <FormInput
              type='text'
              name='thirdDelegateEmail'
              label='Third Delegate Email'
              defaultValue={profile.thirdDelegateEmail}
            />
            <FormInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label='Third Delegate Phone Number'
              defaultValue={profile.thirdDelegatePhoneNumber}
            />
            <SubmitButton text='Update Profile' className='mt-6 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}
export default Profile
