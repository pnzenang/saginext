import SubmitButton from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';

import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';

import {
  createMemberAction,
  fetchProfile,
  fetchSingleMember,
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

const DeathAnnouncement = async ({ params }: { params: { id: string } }) => {
  const profile = await fetchProfile();
  const queryClient = new QueryClient();
  const member = await fetchSingleMember(params.id);
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
    status,
  } = member;
  return (
    <section className='border-4 border-purple-500 rounded-lg mt-48'>
      <h1 className='text-2xl sm:text-4xl lg:text-6xl font-semibold mb-2 p-10 text-purple-500'>
        Post member's death
        <span className=' text-purple-500 block mt-1 text-sm sm:text-xl'>
          Sorry for the loss, check your entry very well before submission, the
          process is not reversible.
        </span>
      </h1>

      <div className='border p-8 rounded-md '>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FormContainer action={createMemberAction}>
            <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 '>
              <FormInput
                type='text'
                name='firstName'
                label='Member First Name'
                value={firstName}
                readonly={true}
              />
              <FormInput
                type='text'
                name='middleName'
                label='Member Middle Name'
                value={middleName}
                readonly={true}
              />

              <FormInput
                type='text'
                name='lastName'
                label='Member Last Name'
                value={lastName}
                readonly={true}
              />
              <FormInput
                type='text'
                name='countryOfBirth'
                label='Member Country of Birth'
                value={countryOfBirth}
                readonly={true}
              />
              <FormInput
                type='text'
                name='dateOfBirth'
                label='Member Date Of Birth'
                placeholder='MM/DD/YYYY'
                value={dateOfBirth}
                readonly={true}
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
              <FormInput
                type='text'
                name='matriculation'
                label='Matriculation Number'
                value={matriculation}
                readonly={true}
              />
              <FormInput
                type='text'
                name='associationCode'
                label='Delegate Recommendation'
                value={recommendation}
                readonly={true}
              />
              <FormInput
                type='text'
                name='associationCode'
                label='Member Status'
                value={status}
                readonly={true}
              />
              <FormInput
                type='text'
                name='dateOfDeath'
                label='Member Date Of Death'
                placeholder='MM/DD/YYYY'
              />
              <FormInput
                type='text'
                name='countryOfBirth'
                label='City and State of Death'
              />
            </div>
            {/* <FormSelect
                label='Membr status'
                name='recommendation'
                type='text'
                items={Object.values(DelegateRecommendation)}
              /> */}

            {/* {profile.clerkId === process.env.ADMIN_CLERK_ID ? (
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
              )} */}

            {status === 'pending' ? (
              <div className='w-full text-sm sm:text-md md:text-2xl text-red-500 pt-10 font-bold '>
                You can not post this death because the member was still pending
                at the time of death.
              </div>
            ) : (
              <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
                <SubmitButton
                  text='Post death'
                  className='mt-6 w-full bg-purple-500 hover:bg-purple-800 h-9'
                />
              </div>
            )}
          </FormContainer>
        </HydrationBoundary>
      </div>
    </section>
  );
};
export default DeathAnnouncement;
