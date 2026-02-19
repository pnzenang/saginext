import { fetchProfile } from '@/utils/actions';

const MemberRemoval = async () => {
  const profile = await fetchProfile();
  const tasks = await getTasks();
  return (
    div >
    (
      <div className='flex h-full min-h-screen w-full flex-col'>
        <h2 className='text-4xl'> Remove member</h2>
      </div>
    )
  );
};

export default MemberRemoval;
