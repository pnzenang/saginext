import { fetchProfile } from '@/utils/actions';

const DeathAnnouncement = async () => {
  const profile = await fetchProfile();
  return <h1 className='text-3xl py-32'>Death Announcement</h1>;
};
export default DeathAnnouncement;
