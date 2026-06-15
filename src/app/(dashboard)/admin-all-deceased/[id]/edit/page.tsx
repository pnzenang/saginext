import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import {
  createDeceasedMemberAction,
  fetchProfile,
  fetchSingleDeceasedMemberDetails,
  updateDeceasedMemberDetailsActionAdmin
} from '@/utils/actions'
import { contributionStatus } from '@/utils/types'

const EditCaseStatus = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const deceasedMember = await fetchSingleDeceasedMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    countryOfResidence,
    nameOfBeneficiary,
    memberMatriculationNumber,

    placeOfDeath,
    dateOfDeath,
    associationName,
    createdAt
  } = deceasedMember

  // const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <h1 className='text-xl font-semibold text-purple-600 capitalize md:text-4xl lg:text-5xl'>
          {' '}
          Edit Case Status (Admin){' '}
        </h1>
      </div>
      <div className='rounded-lg border border-purple-800 bg-purple-300/50 p-3 sm:p-8'>
        <FormContainer action={updateDeceasedMemberDetailsActionAdmin}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='Member first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last and middle names'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='Matriculation'
                defaultValue={memberMatriculationNumber}
              />

              <FormInput
                type='text'
                name='registrationDate'
                label='registration date'
                defaultValue={createdAt.toLocaleDateString()}

                // placeholder='MM/DD/YYYY'
              />

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

              <FormInput type='text' name='associationName' label='association code' defaultValue={associationName} />
              <FormInput type='text' name='placeOfDeath' label="member's place of death" defaultValue={placeOfDeath} />

              <FormInput type='text' name='dateOfDeath' label='member date of death' defaultValue={dateOfDeath} />
              <FormSelect
                name='contributionStatus'
                label='Contribution Status'
                items={Object.values(contributionStatus)}
                defaultValue={deceasedMember.contributionStatus}
              />
              <SubmitButton text="post Member's death" className='mt-4 w-full bg-purple-800 hover:bg-purple-900' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default EditCaseStatus
