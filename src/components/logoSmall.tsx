import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const sagiLogoSrc = '/images/sagi-logo.svg'

const LogoSmall = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src={sagiLogoSrc}
        width={100}
        height={60}
        alt='logo'
      />
      {/* <span className='font-semibold'>SAGI</span> */}
    </div>
  )
}

export default LogoSmall
