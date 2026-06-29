import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const sagiLogoSrc = '/images/sagi-logo.svg'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={sagiLogoSrc}
        alt='logo'
        loading='eager'
        width={160}
        height={80}
      />
    </div>
  )
}

export default Logo
