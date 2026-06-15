import { date } from 'zod'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

import {
  fetchProfile,
  fetchSingleMemberDetailsAdmin,
  updateDeceasedMemberDetailsAction,
  updateDeceasedMemberDetailsActionAdmin,
  updateMemberDetailsActionAdmin
} from '@/utils/actions'
import { delegateRecommendation, memberStatus } from '@/utils/types'

const EditMemberDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetailsAdmin(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfResidence,
    clerkId,
    nameOfBeneficiary,
    associationCode,
    associationName
  } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <h1 className='text-primary text-3xl font-semibold capitalize md:text-4xl lg:text-5xl'>
          {' '}
          view and update member&apos;s details (Admin)
        </h1>
        <p className='text-primary text-xs sm:text-lg'>
          Here you can change the member&apos;s name, date of birth, beneficiary&apos;s names, or country of residence.
        </p>
      </div>
      <div className='border-primary bg-muted rounded-lg border p-3 sm:p-8'>
        <FormContainer action={updateMemberDetailsActionAdmin}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='Members first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='Members last and middle names(last name first)'
                defaultValue={lastAndMiddleNames}
              />

              <FormInput type='text' name='dateOfBirth' label='Member date of birth' defaultValue={dateOfBirth} />
              <FormInput
                type='text'
                name='countryOfResidence'
                label='Country Of Residence'
                defaultValue={countryOfResidence}
              />
              <FormInput
                type='text'
                name='nameOfBeneficiary'
                label='Beneficiary Name'
                defaultValue={nameOfBeneficiary}
              />

              <FormInput type='text' name='associationCode' label='association code' defaultValue={associationCode} />
              <FormInput type='text' name='associationName' label='association name' defaultValue={associationName} />

              <FormSelect
                label='delegate recommendation'
                items={Object.values(delegateRecommendation)}
                name='delegateRecommendation'
                defaultValue={member.delegateRecommendation}
              />
              <FormSelect
                label='member status'
                name='memberStatus'
                items={Object.values(memberStatus)}
                defaultValue={member.memberStatus}
              />

              <SubmitButton text='Update member Information' className='mt-4 w-full' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default EditMemberDetailPage
