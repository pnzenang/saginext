import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import db from '@/utils/db'
import { createProfileAction } from '@/utils/profile-actions'

const createProfileCopy = {
  en: {
    title: 'create association profile',
    labels: {
      associationName: 'Association Name(The Name of your association, group or family)',
      associationCode: "Association Code(Keep the code you already have or create one if you didn't have one before)",
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
    submit: 'Create Profile'
  },
  fr: {
    title: "créer le profil de l'association",
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
    submit: 'Créer le profil'
  }
} as const

const CreateProfilePage = async () => {
  const [{ userId }, language] = await Promise.all([auth(), getDashboardLanguage()])
  const copy = createProfileCopy[language]

  if (!userId) redirect('/sign-in')

  const profile = await db.profile.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      id: true,
      internalRulesAcceptedAt: true
    }
  })

  if (profile) redirect(profile.internalRulesAcceptedAt ? '/all-members' : '/internal-rules')

  return (
    <section className='flex w-full min-w-0 flex-col overflow-hidden py-8 sm:py-10'>
      <h1 className='mb-6 text-2xl leading-tight font-semibold break-words capitalize md:text-4xl lg:text-5xl'>
        {copy.title}
      </h1>
      <div className='border-primary bg-muted w-full max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8'>
        <FormContainer action={createProfileAction}>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2'>
            <FormInput type='text' name='associationName' label={copy.labels.associationName} />
            <FormInput
              type='text'
              name='associationCode'
              label={copy.labels.associationCode}
              maxLength={4}
              pattern='[A-Za-z]{4}'
              title='Enter exactly 4 letters, no numbers'
              autoComplete='off'
            />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='firstDelegateFullName' label={copy.labels.firstDelegateFullName} />
            <MaskPhoneInput
              type='text'
              name='firstDelegatePhoneNumber'
              label={copy.labels.firstDelegatePhoneNumber}
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='firstDelegateEmail' label={copy.labels.firstDelegateEmail} />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='secondDelegateFullName' label={copy.labels.secondDelegateFullName} />
            <MaskPhoneInput
              type='text'
              name='secondDelegatePhoneNumber'
              label={copy.labels.secondDelegatePhoneNumber}
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='secondDelegateEmail' label={copy.labels.secondDelegateEmail} />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <FormInput type='text' name='thirdDelegateFullName' label={copy.labels.thirdDelegateFullName} />
            <MaskPhoneInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label={copy.labels.thirdDelegatePhoneNumber}
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='thirdDelegateEmail' label={copy.labels.thirdDelegateEmail} />
          </div>
          <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
            <SubmitButton text={copy.submit} className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default CreateProfilePage
