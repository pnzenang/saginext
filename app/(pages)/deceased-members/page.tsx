import { fetchProfile, allMembersAction } from '@/utils/actions';

const DeceasedMembers = async () => {
  const profile = await fetchProfile();
  return <h1 className='text-3xl py-32'>Deceased Members</h1>;
};
export default DeceasedMembers;
