import DeleteSubmitButton from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';

import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';

import {
  createMemberAction,
  fetchProfile,
  fetchSingleMember,
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

const EditMemberInfo = async ({ params }: { params: { id: string } }) => {
  const profile = await fetchProfile();
  // const queryClient = new QueryClient();
  const { id } = params;
  const member = await fetchSingleMember(id);
  const {
    createdAt,
    matriculation,
    firstName,
    middleName,
    lastName,
    countryOfBirth,
    dateOfBirth,
    associationCode,
    associationName,
    recommendation,
    beneficiary,
    status,
  } = member;
  return (
    <section className='border-4 border-primary rounded-lg mt-48'>
      <h1 className='text-3xl sm:text-4xl lg:text-6xl font-semibold mb-2 p-10 text-primary'>
        Edit member information
        <span className=' text-primary block mt-1 sm:text-xl'>
          Here, you can change the member date of birth, country of birth or
          delegate recommendation and beneficiary name.
        </span>
      </h1>

      <div className='border p-8 rounded-md '>
        {/* <HydrationBoundary state={dehydrate(queryClient)}> */}
        <FormContainer action={updateMemberAction}>
          <div className='grid md:grid-cols-3 gap-4 mt-4'>
            <input type='hidden' name='id' value={id} />
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='firstName'
                label='Member First Name'
                defaultValue={firstName}
              />
            ) : (
              <FormInput
                type='text'
                name='firstName'
                label='Member First Name'
                value={firstName}
                readonly={true}
              />
            )}
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='middleName'
                label='Member Middle Name'
                defaultValue={middleName}
              />
            ) : (
              <FormInput
                type='text'
                name='middleName'
                label='Member Middle Name'
                value={middleName}
                readonly={true}
              />
            )}
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='lastName'
                label='Member last Name'
                defaultValue={lastName}
              />
            ) : (
              <FormInput
                type='text'
                name='lastName'
                label='Member last Name'
                value={lastName}
                readonly={true}
              />
            )}
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='countryOfBirth'
                label='Member Country of Birth'
                defaultValue={countryOfBirth}
              />
            ) : (
              <FormInput
                type='text'
                name='countryOfBirth'
                label='Member Country of Birth'
                value={countryOfBirth}
                readonly={true}
              />
            )}
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='dateOfBirth'
                label='Member date of Birth'
                defaultValue={dateOfBirth}
              />
            ) : (
              <FormInput
                type='text'
                name='dateOfBirth'
                label='Member date of Birth'
                value={dateOfBirth}
                readonly={true}
              />
            )}
            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='associationName'
                label='Association Name'
                defaultValue={profile.associationName}
              />
            ) : (
              <FormInput
                type='text'
                name='associationName'
                label='Association Name'
                value={profile.associationName}
                readonly={true}
              />
            )}

            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='associationCode'
                label='Association Code'
                defaultValue={profile.associationCode}
              />
            ) : (
              <FormInput
                type='text'
                name='associationCode'
                label='Association Code'
                value={profile.associationCode}
                readonly={true}
              />
            )}

            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormInput
                type='text'
                name='matriculation'
                label='Matriculation Number'
                defaultValue={matriculation}
              />
            ) : (
              <FormInput
                type='text'
                name='matriculation'
                label='Matriculation Number'
                value={matriculation}
                readonly={true}
              />
            )}
            <FormInput
              type='text'
              name='beneficiary'
              label='Beneficiary Full Name'
              defaultValue={beneficiary}
            />
            <FormSelect
              type='text'
              name='recommendation'
              label='Delegate Recommendation'
              items={Object.values(DelegateRecommendation)}
              defaultValue={recommendation}
            />

            {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
              <FormSelect
                type='text'
                name='status'
                label='Member Status'
                items={Object.values(MemberStatus)}
                defaultValue={status}
              />
            ) : (
              <FormSelect
                type='text'
                name='status'
                label='Member Status'
                items={[MemberStatus.Pending]}
                defaultValue={recommendation}
              />
            )}
            <DeleteSubmitButton
              text='submit changes'
              className='mt-6 w-full bg-primary hover:bg-primary/90 h-9'
            />
          </div>
        </FormContainer>
        {/* </HydrationBoundary> */}
      </div>
    </section>
  );
};
export default EditMemberInfo;
