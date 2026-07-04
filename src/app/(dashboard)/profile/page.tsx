import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchProfile, updateProfileAction } from '@/utils/profile-actions'

const profileCopy = {
  en: {
    title: 'association/family/group profile',
    labels: {
      associationName: 'Association Name',
      associationCode: 'Association Code',
      firstDelegateFullName: 'First Delegate Name',
      firstDelegatePhoneNumber: 'First Delegate Phone Number',
      firstDelegateEmail: 'First Delegate Email',
      secondDelegateFullName: 'Second Delegate Name',
      secondDelegatePhoneNumber: 'Second Delegate Phone Number',
      secondDelegateEmail: 'Second Delegate Email',
      thirdDelegateFullName: 'Board Member Name',
      thirdDelegatePhoneNumber: 'Board Member Phone Number',
      thirdDelegateEmail: 'Board Member Email'
    },
    submit: 'Update Profile'
  },
  fr: {
    title: 'profil association/famille/groupe',
    labels: {
      associationName: "Nom de l'association",
      associationCode: "Code de l'association",
      firstDelegateFullName: 'Nom du premier délégué',
      firstDelegatePhoneNumber: 'Téléphone du premier délégué',
      firstDelegateEmail: 'E-mail du premier délégué',
      secondDelegateFullName: 'Nom du deuxième délégué',
      secondDelegatePhoneNumber: 'Téléphone du deuxième délégué',
      secondDelegateEmail: 'E-mail du deuxième délégué',
      thirdDelegateFullName: 'Nom du membre du bureau',
      thirdDelegatePhoneNumber: 'Téléphone du membre du bureau',
      thirdDelegateEmail: 'E-mail du membre du bureau'
    },
    submit: 'Mettre à jour le profil'
  }
} as const

const Profile = async () => {
  const [language, profile] = await Promise.all([getDashboardLanguage(), fetchProfile()])
  const copy = profileCopy[language]

  return (
    <section className='flex w-full min-w-0 flex-col overflow-hidden py-8 sm:py-10'>
      <h1 className='mb-6 text-2xl leading-tight font-semibold break-words capitalize md:text-4xl lg:text-5xl'>
        {copy.title}
      </h1>
      <div className='border-primary bg-primary/15 w-full max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8'>
        <FormContainer action={updateProfileAction}>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2'>
            <FormInput
              type='text'
              name='associationName'
              label={copy.labels.associationName}
              defaultValue={profile.associationName}
            />
            <FormInput
              type='text'
              name='associationCode'
              label={copy.labels.associationCode}
              defaultValue={profile.associationCode}
            />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='firstDelegateFullName'
              label={copy.labels.firstDelegateFullName}
              defaultValue={profile.firstDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='firstDelegatePhoneNumber'
              label={copy.labels.firstDelegatePhoneNumber}
              defaultValue={profile.firstDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='firstDelegateEmail'
              label={copy.labels.firstDelegateEmail}
              defaultValue={profile.firstDelegateEmail}
            />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='secondDelegateFullName'
              label={copy.labels.secondDelegateFullName}
              defaultValue={profile.secondDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='secondDelegatePhoneNumber'
              label={copy.labels.secondDelegatePhoneNumber}
              defaultValue={profile.secondDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='secondDelegateEmail'
              label={copy.labels.secondDelegateEmail}
              defaultValue={profile.secondDelegateEmail}
            />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='thirdDelegateFullName'
              label={copy.labels.thirdDelegateFullName}
              defaultValue={profile.thirdDelegateFullName}
            />
            <MaskPhoneInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label={copy.labels.thirdDelegatePhoneNumber}
              defaultValue={profile.thirdDelegatePhoneNumber}
            />
            <FormInput
              type='text'
              name='thirdDelegateEmail'
              label={copy.labels.thirdDelegateEmail}
              defaultValue={profile.thirdDelegateEmail}
            />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <SubmitButton text={copy.submit} className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default Profile
