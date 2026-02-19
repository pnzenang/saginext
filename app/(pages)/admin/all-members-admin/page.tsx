import { fetchProfile } from '@/utils/actions';

const AllMembersAdmin = async () => {
  const profile = await fetchProfile();
  return <h1 className='text-3xl py-32 '>All Members Admin</h1>;
};
export default AllMembersAdmin;
