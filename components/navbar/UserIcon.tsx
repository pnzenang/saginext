import { FaRegCircleUser } from 'react-icons/fa6'
import { SignedOut, SignedIn } from '@clerk/nextjs'
const UserIcon = () => {
  return (
    <>
      <SignedOut>
        <FaRegCircleUser className='w-6 h-6  rounded-full p-1' />
      </SignedOut>
      <SignedIn>
        <FaRegCircleUser className='w-6 h-6  rounded-full text-primary p-1' />
      </SignedIn>
    </>
  )
}
export default UserIcon
