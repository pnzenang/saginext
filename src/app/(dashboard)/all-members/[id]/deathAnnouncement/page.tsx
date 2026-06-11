import { IoIosWarning } from 'react-icons/io'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormInputS from '@/components/forms/FormInputS'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { RiArrowGoBackLine } from 'react-icons/ri'
import {
  createDeceasedMemberAction,
  fetchProfile,
  fetchSingleMemberDetails,
  updateMemberDetailsAction
} from '@/utils/actions'
import { contributionStatus, delegateRecommendation, memberStatus } from '@/utils/types'
import Link from 'next/link'
import { BsSignStopFill } from 'react-icons/bs'

const DeathAnnouncement = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    countryOfResidence,
    nameOfBeneficiary,
    memberMatriculationNumber,
    createdAt,
    associationName
  } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <div className='flex flex-row items-center'>
          <IoIosWarning size={60} className='text-purple-500' />
          <h1 className='text-2xl font-semibold text-purple-600 capitalize sm:text-6xl'> death announcement </h1>
        </div>
        <p className='text-xs text-purple-500 sm:text-lg'>
          Check your entry well before submission, the process is not reversible once submitted. Sorry for the loss of
          your member.
        </p>
      </div>
      <div className='rounded-lg border border-purple-800 bg-purple-300/50 p-8'>
        <FormContainer action={createDeceasedMemberAction}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last  and middle names '
                value={lastAndMiddleNames}
                readOnly
              />
              {/* <FormInputS type='text' name='middleName' label='member middle name ' defaultValue={middleName} /> */}
              <FormInput type='text' name='firstName' label='member first names' value={firstName} readOnly />

              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='Matriculation'
                value={memberMatriculationNumber}
                readOnly
              />
              <FormInput
                type='text'
                name='registrationDate'
                label='registration date'
                value={createdAt.toLocaleDateString()}
                readOnly
              />
              <FormInput
                type='text'
                name='countryOfResidence'
                label='Country Of Residence'
                value={countryOfResidence}
                readOnly
              />
              {/* </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
              {/* <input type='hidden' name='id' value={id} /> */}

              <FormInput
                type='text'
                name='nameOfBeneficiary'
                label='Name fo Beneficiary'
                value={nameOfBeneficiary}
                readOnly
              />
              <FormInput
                type='text'
                name='associationName'
                label='member association name'
                value={associationName}
                readOnly
              />
              {/* <FormInput
                type='text'
                name='associationCode'
                label='member association code'
                defaultValue={profile.associationCode}
              /> */}
              {/* </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
              <input type='hidden' name='id' value={id} />
              <FormInput type='text' name='placeOfDeath' label="member's place of death" />
              <MaskDateInput type='text' name='dateOfDeath' label="member's date of death" placeholder='MM/DD/YYYY' />
              <FormSelect
                name='contributionStatus'
                label='Contribution Status'
                items={[contributionStatus.review]}
                defaultValue={contributionStatus.review}
              />
              {member.memberStatus === memberStatus.Vested && (
                <SubmitButton text="post member's death" className='mt-4 w-full bg-purple-800 hover:bg-purple-900' />
              )}
            </div>
            {member.memberStatus !== memberStatus.Vested && (
              <div className='mt-10 flex flex-col items-center justify-center gap-1 sm:flex-row'>
                <BsSignStopFill className='size-8 text-red-500' />{' '}
                <h1 className='text-center text-xs font-semibold text-red-500 sm:text-lg'>
                  You can not announce the death of {member.lastAndMiddleNames} {member.firstName} because he or she is
                  not vested.
                </h1>
                <Link href='/all-members' className='text-red-900/60 hover:underline'>
                  Back to the members' List
                  <RiArrowGoBackLine className='px- inline' />
                </Link>
              </div>
            )}
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default DeathAnnouncement
