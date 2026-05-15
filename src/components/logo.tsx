import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative', className)}>
      <Image
        src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1777010615/mySagi_kjlgfp.svg'
        alt='logo'
        loading='eager'
        width={160}
        height={80}
      />
    </div>
  )
}

export default Logo
