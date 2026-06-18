import {
  BookCheck,
  Cross,
  Navigation,
  SquareUser,
  Trash2,
  UserCog,
  UserMinus,
  UserPlus,
  FileStack,
  Users,
  Wallet,
  WalletCards,
  WalletMinimal,
  CreditCard,
  List,
  Megaphone,
  Table,
  Pencil
} from 'lucide-react'

import type { MenuItem } from './types'

export const pagesItems: MenuItem[] = [
  {
    icon: Navigation,
    label: 'Navigation Instructions',
    href: '/navigation-instructions'
  },
  {
    icon: BookCheck,
    label: 'Internal Rules At Glance',
    href: '/internal-rules'
  },

  {
    icon: UserPlus,
    label: 'Add Member',
    href: '/add-member'
  },
  {
    icon: Users,
    label: 'All Members',
    href: '/all-members'
  },
  {
    icon: WalletCards,
    label: 'Registrations Payments',
    href: '/registrationsPayments'
  },
  {
    icon: Wallet,
    label: 'Contributions Payments',
    href: '/contributions'
  },
  {
    icon: UserMinus,
    label: 'Remove Member',
    href: '/navigation-instructions/removedMembers'
  },

  {
    icon: Trash2,
    label: 'Removed Members',
    href: '/removed-members'
  },
  {
    icon: Megaphone,
    label: 'Death Announcement',
    href: '/navigation-instructions/deathAnnouncement'
  },
  {
    icon: Cross,
    label: 'All Deceased Members',
    href: '/deceased-members'
  },
  {
    icon: CreditCard,
    label: 'Payment Instructions',
    href: '/payment-instructions'
  },
  {
    icon: List,
    label: 'Monthly Additions',
    href: '/additions'
  },
  {
    icon: Table,
    label: 'Contribution Table',
    href: '/contribution-table'
  },
  // {
  //   icon: WalletMinimal,
  //   label: ' Financial Positions',
  //   href: '/financial-position'
  // },

  {
    icon: FileStack,
    label: 'Death Documentations',
    href: '/death-documentations'
  },
  {
    icon: Pencil,
    label: 'Name Change & Documentations',
    href: '/name-modification'
  },
  {
    icon: SquareUser,
    label: 'Profile',
    href: '/profile'
  },
  {
    icon: UserCog,
    label: 'Admin All Members',
    href: '/admin-all-members'
  },
  {
    icon: UserCog,
    label: 'Admin All Removed',
    href: '/admin-all-removed'
  },
  {
    icon: UserCog,
    label: 'Admin All Deceased',
    href: '/admin-all-deceased'
  },
  {
    icon: UserCog,
    label: 'Admin Count ',
    href: '/admin-count'
  },
  {
    icon: Wallet,
    label: 'Admin Contribution Payments',
    href: '/admin-contribution-payments'
  },
  {
    icon: WalletCards,
    label: 'Admin Registration Payments',
    href: '/admin-registration-payments'
  }
]
