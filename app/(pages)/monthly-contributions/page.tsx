import { fetchProfile } from '@/utils/actions';

const MonthlyContributions = async () => {
  const profile = await fetchProfile();

  return <h1 className='text-3xl py-32'>Monthly Contributions</h1>;
};
export default MonthlyContributions;
