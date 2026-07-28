import { IoIosWarning } from 'react-icons/io'
import { BsSignStopFill } from 'react-icons/bs'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { createRemovedMemberAction, fetchSingleMemberDetails } from '@/utils/actions'
import {
  countryOfResidenceOptions,
  getCountryOfResidenceDefault,
  memberStatus,
  reasonForLeaving
} from '@/utils/types'

const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfResidence,
    memberMatriculationNumber,
    associationCode,
    createdAt,
    associationName,
    memberStatus: currentMemberStatus
  } = member

  const currentDay = new Date().getDate()
  const isWithdrawalBlocked = currentMemberStatus === memberStatus.Vested && currentDay >= 6 && currentDay <= 24

  return (
    <section className='mt-16 flex flex-col'>
      <div className='mt-4 flex flex-row items-center'>
        <IoIosWarning size={60} className='text-red-500' />
        <h1 className='text-3xl font-semibold text-red-600 capitalize md:text-4xl lg:text-5xl'> member Removal </h1>
      </div>
      <div>
        {!isWithdrawalBlocked ? (
          <p className='text-xs text-red-500 sm:text-lg'>
            Check your entry well before submission. If this removal is a mistake, you can restore the member from
            Removed Members within 48 hours by clicking the Restore button. Sorry to see your member go.
          </p>
        ) : null}
      </div>

      <div className='border-destructive rounded-lg border bg-red-800/40 p-3 sm:p-8'>
        <FormContainer action={createRemovedMemberAction}>
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
                label='Country of Residence'
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

              {!isWithdrawalBlocked && (
                <SubmitButton text='Withdraw member' className='mt-4 w-full bg-red-800 hover:bg-red-900' />
              )}
            </div>
            {isWithdrawalBlocked && (
              <div className='mt-10 flex flex-col items-center justify-center gap-1 sm:flex-row'>
                <BsSignStopFill className='size-8 items-center text-red-500' />{' '}
                <h1 className='text-center text-sm font-semibold text-red-500 sm:text-lg'>
                  SAGI prevents withdrawal of vested members between the 6th and the 24th of each month. Resume
                  withdrawal on or after the 25th, and before the 6th.
                </h1>
              </div>
            )}
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default RemoveMember
