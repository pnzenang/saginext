import {
  BookCheck,
  Cross,
  Navigation,
  SquareUser,
  Trash2,
  UserCog,
  UserPlus,
  FileStack,
  Users,
  Wallet,
  FileCheck,
  WalletCards,
  WalletMinimal,
  CreditCard,
  List,
  Table,
  ArrowRightLeft,
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
    icon: Trash2,
    label: 'Removed Members',
    href: '/removed-members'
  },
  {
    icon: Cross,
    label: 'All Deceased Members',
    href: '/deceased-members'
  },
  {
    icon: WalletCards,
    label: 'Registrations Payments',
    href: '/registrations'
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
  {
    icon: Wallet,
    label: 'Contributions Payments',
    href: '/contributions'
  },
  {
    icon: WalletMinimal,
    label: 'Financial Positions',
    href: '/financial-position'
  },

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
    icon: CreditCard,
    label: 'Payment Instructions',
    href: '/payment-instructions'
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
  }
]
