import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { createMemberAction, fetchProfile } from '@/utils/actions'
import { countryOfResidenceOptions, delegateRecommendation, memberStatus } from '@/utils/types'

const AddMember = async () => {
  const user = await fetchProfile()

  // console.log(user)

  return (
    <section className='mt-16 flex flex-col'>
      <h1 className='my-5 text-2xl font-semibold capitalize md:text-4xl lg:text-5xl'> add new member</h1>
      <p className='pb-4 text-sm sm:text-lg'>
        <span className='text-primary font-bold'>Please read first: </span>
        Adding members is the first step toward their registration, the waiting period is at least 60 days within witch,{' '}
        <span className='font-bold'>
          {' '}
          their $20 registration fees should be received by the admin before they start participating in the program.
          Also, if the registration fees is not received withing the 60 days, the members will be removed from our
          database.
        </span>{' '}
        When you are ready to pay for their registration fee and their anticipated contribution, go to{' '}
        <span className='font-bold'>Registration Payments</span> in the sidebar to send and records the registration
        payments of the members you are registering.{' '}
        <span className='text-primary font-bold'>Not following these steps may delay your registration.</span>
      </p>
      <div className='border-primary bg-muted rounded-lg border p-3 sm:p-8'>
        <FormContainer action={createMemberAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='lastAndMiddleNames'
              label='last & middle names (Last Name First & No Abbreviation)'
            />
            {/* <FormInputS type='text' name='middleName' label='member middle name' /> */}
            <FormInput type='text' name='firstName' label='member first names' />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <MaskDateInput type='text' name='dateOfBirth' label='member date of birth' placeholder='MM / DD / YYYY' />
            <FormSelect
              name='countryOfResidence'
              label='Country Of Residence'
              items={countryOfResidenceOptions}
              defaultValue={countryOfResidenceOptions[0]}
            />
            <FormInput type='text' name='nameOfBeneficiary' label='Name of the Beneficiary' />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <FormInput
              type='text'
              name='associationName'
              label='member association name'
              value={user.associationName}
              readOnly
            />
            <FormInput
              type='text'
              name='associationCode'
              label='member association code'
              value={user.associationCode}
              readOnly
            />
            <FormSelect
              label='delegate recommendation'
              items={Object.values(delegateRecommendation)}
              name='delegateRecommendation'
              defaultValue={delegateRecommendation.Confirm}
            />
            {/* </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'> */}
            <FormSelect
              label='member status'
              name='memberStatus'
              items={[memberStatus.Pending]}
              defaultValue={memberStatus.Pending}
            />
            <SubmitButton text='add member' className='mt-4 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default AddMember
