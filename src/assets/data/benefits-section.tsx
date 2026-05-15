import {
  BusIcon,
  ChartSplineIcon,
  CircleDollarSignIcon,
  CoffeeIcon,
  DollarSignIcon,
  HandCoinsIcon,
  HouseIcon,
  PlaneIcon,
  ShoppingCartIcon
} from 'lucide-react'

import type { TransactionRow } from '@/components/blocks/benefits-section/accounting-of-transaction'
import type { TransactionItem } from '@/components/blocks/benefits-section/updated-balanced-card'

export const transactions: TransactionItem[] = [
  {
    id: '1',
    amount: 68,
    type: 'credit'
  },
  {
    id: '2',
    amount: 37,
    type: 'debit'
  },
  {
    id: '4',
    amount: 43,
    type: 'debit'
  },
  {
    id: '3',
    amount: 62,
    type: 'credit'
  },
  {
    id: '5',
    amount: 50,
    type: 'debit'
  }
]

export const spendingCategories = ['Personal', 'Food', 'Entertainment', 'Traveling', 'Shopping', 'Rent']

export const accountTransactions: TransactionRow[] = [
  {
    reverse: false,
    transactions: [
      {
        title: 'Shopping',
        amount: 30980,
        icon: <ShoppingCartIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Consulting',
        amount: 25000,
        icon: <CircleDollarSignIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Coffee',
        amount: 40780,
        icon: <CoffeeIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Stocks',
        amount: 12500,
        icon: <ChartSplineIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Ticket Booking',
        amount: 30980,
        icon: <BusIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Salary',
        amount: 12500,
        icon: <HandCoinsIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Rent',
        amount: 21432,
        icon: <HouseIcon />,
        difference: 568,
        type: 'debit',
        isBordered: true
      }
    ]
  },
  {
    reverse: true,
    transactions: [
      {
        title: 'Consulting',
        amount: 25000,
        icon: <CircleDollarSignIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Shopping',
        amount: 30980,
        icon: <ShoppingCartIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Traveling',
        amount: 32000,
        icon: <PlaneIcon />,
        difference: 1200,
        type: 'debit',
        isBordered: true
      },
      {
        title: 'Salary',
        amount: 18500,
        icon: <HandCoinsIcon />,
        difference: 568,
        type: 'credit'
      },
      {
        title: 'Subscriptions',
        amount: 12500,
        icon: <DollarSignIcon />,
        difference: 568,
        type: 'debit',
        isBordered: true
      },
      {
        title: 'Rent',
        amount: 21432,
        icon: <HouseIcon />,
        difference: 568,
        type: 'debit'
      },
      {
        title: 'Other',
        amount: 21432,
        icon: <DollarSignIcon />,
        difference: 568,
        type: 'debit',
        isBordered: true
      }
    ]
  },
  {
    reverse: false,
    transactions: [
      {
        title: 'Shopping',
        amount: 30980,
        icon: <ShoppingCartIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Other',
        amount: 21432,
        icon: <DollarSignIcon />,
        difference: 568,
        type: 'debit',
        isBordered: true
      },
      {
        title: 'Coffee',
        amount: 40780,
        icon: <CoffeeIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Payment',
        amount: 12500,
        icon: <CircleDollarSignIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Ticket Booking',
        amount: 30980,
        icon: <BusIcon />,
        difference: 1200,
        type: 'debit'
      },
      {
        title: 'Consulting',
        amount: 25000,
        icon: <CircleDollarSignIcon />,
        difference: 568,
        type: 'credit',
        isBordered: true
      },
      {
        title: 'Rent',
        amount: 21432,
        icon: <HouseIcon />,
        difference: 568,
        type: 'debit',
        isBordered: true
      }
    ]
  }
]
