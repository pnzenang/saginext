import SubmitButton from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';

import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';

import {
  createMemberAction,
  fetchProfile,
  updateMemberAction,
} from '@/utils/actions';
import {
  DelegateRecommendation,
  MemberStatus,
  // SingleMemberStatus,
} from '@/utils/types';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
const AddMembers = async () => {
  const profile = await fetchProfile();
  const queryClient = new QueryClient();

  return (
    <section className='border-4 border-primary rounded-lg mt-48'>
      <h1 className='text-3xl sm:text-4xl lg:text-6xl font-semibold mb-2 capitalize p-10 text-primary'>
        Add member
        <span className='text-sm text-primary block mt-2 '>
          Add the information as they appear in the member's official documents.
        </span>
      </h1>

      <div className='border p-8 rounded-md '>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FormContainer action={createMemberAction}>
            <div className='grid md:grid-cols-3 gap-4 mt-4'>
              <FormInput
                type='text'
                name='firstName'
                label='Member First Name'
              />
              <FormInput
                type='text'
                name='middleName'
                label='Member Middle Name'
              />
              <FormInput type='text' name='lastName' label='Member Last Name' />
              <FormInput
                type='text'
                name='countryOfBirth'
                label='Member Country of Birth'
              />
              <FormInput
                type='text'
                name='dateOfBirth'
                label='Member Date Of Birth'
                placeholder='MM/DD/YYYY'
              />
              <FormInput
                label='Beneficiary Full Name'
                name='beneficiary'
                type='text'
              />
              <FormInput
                type='text'
                name='associationName'
                label='Association Name'
                value={profile.associationName}
                readonly={true}
              />

              <FormInput
                type='text'
                name='associationCode'
                label='Association Code'
                value={profile.associationCode}
                readonly={true}
              />
              <FormSelect
                type='text'
                name='recommendation'
                label='Delegate Recommendation'
                items={Object.values(DelegateRecommendation)}
              />
              {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
                <FormSelect
                  type='text'
                  name='status'
                  label='Member Status'
                  items={Object.values(MemberStatus)}
                />
              ) : (
                <FormSelect
                  type='text'
                  name='status'
                  label='Member Status'
                  items={[MemberStatus.Pending]}
                />
              )}
              {/* <FormInput
                type='text'
                name='beneficiaryName'
                label='Beneficiary Full Name'
              /> */}
              <SubmitButton text='Add Member' className='mt-6 w-full' />
            </div>
          </FormContainer>
        </HydrationBoundary>
      </div>
    </section>
  );
};
export default AddMembers;
