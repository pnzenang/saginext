import { TiWarning } from 'react-icons/ti'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { createRemovedMemberActionAdmin, fetchSingleMemberDetailsAdmin } from '@/utils/actions'
import { countryOfResidenceOptions, getCountryOfResidenceDefault, reasonForLeaving } from '@/utils/types'

const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetailsAdmin(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfResidence,
    memberMatriculationNumber,
    associationCode,
    associationName,
    createdAt
  } = member

  return (
    <section className='mt-16 flex flex-col'>
      <div className='mb-5'>
        <div className='my-1 flex flex-row'>
          <TiWarning className='size-8 items-center text-red-500 sm:size-15' />
          <h1 className='text-2xl font-semibold text-red-600 capitalize md:text-4xl lg:text-5xl'> member Removal </h1>
        </div>
        <p className='text-xs text-red-500 sm:text-lg'>
          Check your entry well before submission. If this removal is a mistake, you can restore the member from Removed
          Members within 48 hours.
        </p>
      </div>
      <div className='border-destructive rounded-lg border bg-red-800/40 p-3 sm:p-8'>
        <FormContainer action={createRemovedMemberActionAdmin}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last and middle names'
                defaultValue={lastAndMiddleNames}
              />
              {/* <FormInputS type='text' name='middleName' label='member middle name' defaultValue={middleName} /> */}
              <FormInput type='text' name='firstName' label='member first names' value={firstName} readOnly />
              <FormInput type='text' name='dateOfBirth' label='member date of birth' defaultValue={dateOfBirth} />
              <FormSelect
                name='countryOfResidence'
                label='Country Of Residence'
                items={countryOfResidenceOptions}
                defaultValue={getCountryOfResidenceDefault(countryOfResidence)}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='matriculation'
                defaultValue={memberMatriculationNumber}
              />
              <FormInput
                type='text'
                name='associationName'
                label='member association name'
                defaultValue={associationName}
              />
              <FormInput
                type='text'
                name='associationCode'
                label='member association code'
                defaultValue={associationCode}
              />
              <FormInput
                type='text'
                name='registrationDate'
                label='registration date'
                value={createdAt.toLocaleDateString()}
                readOnly
              />
              <FormSelect
                label='reason for leaving'
                items={Object.values(reasonForLeaving)}
                name='reasonForLeaving'
                defaultValue={reasonForLeaving.NoReason}
              />

              <SubmitButton text='Withdraw member' className='mt-4 w-full bg-red-800 hover:bg-red-900' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default RemoveMember
