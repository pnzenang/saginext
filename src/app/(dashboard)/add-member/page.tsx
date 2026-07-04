import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { createMemberAction, fetchProfile } from '@/utils/actions'
import { countryOfResidenceOptions, defaultCountryOfResidence, delegateRecommendation, memberStatus } from '@/utils/types'

const addMemberCopy = {
  en: {
    title: 'add new member',
    introLabel: 'Please read first: ',
    intro:
      'Adding members is the first step toward their registration, the waiting period is at least 60 days within which,',
    introBold:
      'their $20 registration fees should be received by the admin before they start participating in the program. Also, if the registration fees is not received within the 60 days, the members will be removed from our database.',
    introAfter:
      'When you are ready to pay for their registration fee and their anticipated contribution, go to',
    registrationPayments: 'Registration Payments',
    introAfterLink: 'in the sidebar to send and record the registration payments of the members you are registering.',
    warning: 'Not following these steps may delay your registration.',
    labels: {
      lastAndMiddleNames: 'last & middle names (Last Name First & No Abbreviation)',
      firstName: 'member first names',
      dateOfBirth: 'member date of birth',
      countryOfResidence: 'Country Of Residence',
      nameOfBeneficiary: 'Name of the Beneficiary',
      associationName: 'member association name',
      associationCode: 'member association code',
      delegateRecommendation: 'delegate recommendation',
      memberStatus: 'member status'
    },
    submit: 'add member'
  },
  fr: {
    title: 'ajouter un nouveau membre',
    introLabel: "Veuillez lire d'abord : ",
    intro:
      "L'ajout d'un membre est la première étape de son inscription. La période d'attente est d'au moins 60 jours pendant laquelle",
    introBold:
      "les frais d'inscription de 20 $ doivent être reçus par l'administration avant que le membre commence à participer au programme. Si les frais d'inscription ne sont pas reçus dans les 60 jours, le membre sera retiré de notre base de données.",
    introAfter:
      "Lorsque vous êtes prêt à payer les frais d'inscription et la contribution prévue, allez à",
    registrationPayments: "Paiements d'inscription",
    introAfterLink:
      "dans la barre latérale pour envoyer et enregistrer les paiements d'inscription des membres que vous inscrivez.",
    warning: 'Ne pas suivre ces étapes peut retarder votre inscription.',
    labels: {
      lastAndMiddleNames: "nom et prénoms intermédiaires (nom de famille d'abord, sans abréviation)",
      firstName: 'prénoms du membre',
      dateOfBirth: 'date de naissance du membre',
      countryOfResidence: 'Pays de résidence',
      nameOfBeneficiary: 'Nom du bénéficiaire',
      associationName: "nom de l'association du membre",
      associationCode: "code de l'association du membre",
      delegateRecommendation: 'recommandation du délégué',
      memberStatus: 'statut du membre'
    },
    submit: 'ajouter le membre'
  }
} as const

const AddMember = async () => {
  const [language, user] = await Promise.all([getDashboardLanguage(), fetchProfile()])
  const copy = addMemberCopy[language]

  // console.log(user)

  return (
    <section className='mt-16 flex flex-col'>
      <h1 className='my-5 text-2xl font-semibold capitalize md:text-4xl lg:text-5xl'>{copy.title}</h1>
      <p className='pb-4 text-sm sm:text-lg'>
        <span className='text-primary font-bold'>{copy.introLabel}</span>
        {copy.intro} <span className='font-bold'>{copy.introBold}</span> {copy.introAfter}{' '}
        <span className='font-bold'>{copy.registrationPayments}</span> {copy.introAfterLink}{' '}
        <span className='text-primary font-bold'>{copy.warning}</span>
      </p>
      <div className='border-primary bg-muted rounded-lg border p-3 sm:p-8'>
        <FormContainer action={createMemberAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='lastAndMiddleNames'
              label={copy.labels.lastAndMiddleNames}
            />
            {/* <FormInputS type='text' name='middleName' label='member middle name' /> */}
            <FormInput type='text' name='firstName' label={copy.labels.firstName} />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <MaskDateInput type='text' name='dateOfBirth' label={copy.labels.dateOfBirth} placeholder='MM / DD / YYYY' />
            <FormSelect
              name='countryOfResidence'
              label={copy.labels.countryOfResidence}
              items={countryOfResidenceOptions}
              defaultValue={defaultCountryOfResidence}
            />
            <FormInput type='text' name='nameOfBeneficiary' label={copy.labels.nameOfBeneficiary} />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <FormInput
              type='text'
              name='associationName'
              label={copy.labels.associationName}
              value={user.associationName}
              readOnly
            />
            <FormInput
              type='text'
              name='associationCode'
              label={copy.labels.associationCode}
              value={user.associationCode}
              readOnly
            />
            <FormSelect
              label={copy.labels.delegateRecommendation}
              items={Object.values(delegateRecommendation)}
              name='delegateRecommendation'
              defaultValue={delegateRecommendation.Confirm}
            />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <FormSelect
              label={copy.labels.memberStatus}
              name='memberStatus'
              items={[memberStatus.Pending]}
              defaultValue={memberStatus.Pending}
            />
            <SubmitButton text={copy.submit} className='mt-4 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default AddMember
