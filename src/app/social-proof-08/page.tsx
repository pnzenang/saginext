import { CheckSquareIcon, LockIcon, StarIcon, UsersIcon } from 'lucide-react'

import SocialProof from '@/components/shadcn-studio/blocks/social-proof-08/social-proof-08'

const features = [
  {
    icon: LockIcon,
    value: '$56 billion',
    description: '24 trading volume'
  },
  {
    icon: CheckSquareIcon,
    value: '600+',
    description: 'Cryptocurrencies listed on our platform'
  },
  {
    icon: UsersIcon,
    value: '1,200+',
    description: 'Daily active users'
  },
  {
    icon: StarIcon,
    value: '90%',
    description: 'Customer satisfaction rating'
  }
]

const SocialProofPage = () => {
  return <SocialProof features={features} />
}

export default SocialProofPage
