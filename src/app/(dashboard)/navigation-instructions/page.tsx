import {
  ArrowRightLeft,
  CreditCard,
  Cross,
  FileStack,
  Pencil,
  Table,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  WalletCards,
  WalletMinimal
} from 'lucide-react'

import Features from '@/components/shadcn-studio/blocks/features-section-01/features-section-01'
import { getContributionTableLabel } from '@/utils/contribution-table-label'
import { fetchProfile } from '@/utils/profile-actions'

const NavigationInstructions = async () => {
  await fetchProfile()

  const contributionTableLabel = getContributionTableLabel()

  const localizedFeaturesList = featuresList.map(feature =>
    feature.href === '/navigation-instructions/contributionTable'
      ? {
          ...feature,
          title: contributionTableLabel
        }
      : feature
  )

  return (
    <div className='flex w-full min-w-0 flex-col items-stretch gap-4'>
      <Features className='w-full max-w-full' featuresList={localizedFeaturesList} />
    </div>
  )
}

export default NavigationInstructions

const featuresList = [
  {
    icon: UserPlus,
    title: 'Adding Members',
    description:
      'Add a new member to your family or group by clicking Add Member in the sidebar. Follow the steps carefully to avoid delays.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/addMember'
  },
  {
    icon: Users,
    title: 'Seeing All Your Members',
    description:
      'After adding a member, you can see them in your dashboard by clicking All Members. The member will remain pending until the registration payment is sent and reviewed.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/seeingAllMembers'
  },
  {
    icon: Trash2,
    title: 'Removing & Removed Members',
    description:
      'You can remove a member from the 16th of the month through the 5th of the next month. Removals during this window do not affect the current contribution.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/removedMembers'
  },
  {
    icon: Cross,
    title: 'Death of a Member',
    description:
      'To announce a death, click the three dots at the end of the member row and select Death Announcement. The member must be vested. No document is needed.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/deathAnnouncement'
  },
  {
    icon: WalletCards,
    title: 'Registration Payment',
    description:
      'After you submit a registration, send the registration fee and complete the form under Registration Payments. Please follow the instructions carefully.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/memberRegistration'
  },
  {
    icon: Table,
    title: 'Monthly Contribution',
    description:
      'Here, you will see the names of new members joining the organization this month or next month. This is not the contribution table; it is for information only.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/contributionTable'
  },
  {
    icon: Wallet,
    title: 'Contribution Payment',
    description:
      'Delegates should record each contribution after sending it. They should also upload the payment confirmation to reduce confusion.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/contributionPayment'
  },
  {
    icon: WalletMinimal,
    title: 'Financial Positions',
    description:
      'This spreadsheet allows delegates to see the financial position of their group. If they send more money than required, the difference appears next to their group name.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/groupFinancialPosition'
  },
  {
    icon: FileStack,
    title: 'Death Documentation',
    description:
      'You do not need documentation to announce a death. When the documents are ready, upload them by clicking Death Documentation.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/deathDocumentations'
  },
  {
    icon: Pencil,
    title: 'Name Change',
    description:
      'Click the link to request a name correction or change. Error corrections do not require documents, but name changes require supporting documentation.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/nameChange'
  },
  {
    icon: CreditCard,
    title: 'Payment Instructions',
    description:
      'Use this page to get the payment information needed to send contributions to SAGI. The Zelle QR code is also available on the payment pages.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/paymentInstructions'
  },
  {
    icon: ArrowRightLeft,
    title: 'Transfer',
    description:
      'Use Member Transfer for members already in this database. Use Add Member with a transfer-from recommendation only when the member comes from another SAGI database, such as SAGICAM or SAGINIGERIA.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10',
    href: '/navigation-instructions/membersTransfer'
  }
]
