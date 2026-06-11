import { date } from 'zod'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { fetchProfile, fetchSingleMemberDetails, updateMemberDetailsAction } from '@/utils/actions'
import { delegateRecommendation, memberStatus } from '@/utils/types'
import FormInputS from '@/components/forms/FormInputS'
import { BsSignStopFill } from 'react-icons/bs'

const EditMemberDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfResidence,
    clerkId,
    nameOfBeneficiary,
    associationName,
    associationCode,
    memberStatus
  } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <h1 className='text-primary text-3xl font-semibold capitalize sm:text-6xl'>
          {' '}
          view and update member&apos;s details{' '}
        </h1>
        <p className='text-primary text-xs sm:text-lg'>
          Here you can change the member&apos;s date of birth, beneficiary&apos;s names, or country of residence, but to
          edit the name you need fill out the name change form on the dashboard.
        </p>
      </div>
      <div className='border-primary bg-muted rounded-lg border p-8'>
        <FormContainer action={updateMemberDetailsAction}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last and middle names (Last Name First & no abbreviation)'
                value={lastAndMiddleNames}
                readOnly
              />
              <FormInput type='text' name='firstName' label='member first names' value={firstName} readOnly />
              <input type='hidden' name='id' value={id} />
              <FormInput type='text' name='dateOfBirth' label='member date of birth' defaultValue={dateOfBirth} />
              <FormInput
                type='text'
                name='countryOfResidence'
                label='Country Of Residence'
                defaultValue={countryOfResidence}
              />
              <FormInput
                type='text'
                name='nameOfBeneficiary'
                label='Name fo Beneficiary'
                defaultValue={nameOfBeneficiary}
              />
              {/* </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
              <input type='hidden' name='id' value={id} />
              <FormInput
                type='text'
                name='associationName'
                label='member association name'
                value={associationName}
                readOnly
              />
              <FormInput
                type='text'
                name='associationCode'
                label='member association code'
                value={associationCode}
                readOnly
              />
              <FormSelect
                label='delegate recommendation'
                items={Object.values(delegateRecommendation)}
                name='delegateRecommendation'
                defaultValue={member.delegateRecommendation}
              />
              <FormSelect
                label='member status at registration'
                name='memberStatus'
                items={[memberStatus]}
                defaultValue={memberStatus}
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
