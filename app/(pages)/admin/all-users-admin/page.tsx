import { fetchProfile } from '@/utils/actions'

const AllUsersAdmin = async () => {
  const profile = await fetchProfile()
  return <h1 className='text-3xl py-32'>AllUsersAdmin</h1>
}
export default AllUsersAdmin
