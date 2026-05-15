import type { ReactNode } from 'react'

import Users from '@/assets/svg/users'
import Astronomy from '@/assets/svg/astronomy'
import Messages from '@/assets/svg/messages'

export type PricingPlan = {
  name: string
  icon: ReactNode
  price: {
    monthly: number
    yearly: number
  }
  description: string
  features: string[]
  isHighlighted?: boolean
  isLimited?: boolean
}

export const pricingPlan: PricingPlan[] = [
  {
    name: 'Basic plan',
    icon: <Users />,
    price: {
      monthly: 5.99,
      yearly: 4.99
    },
    description: 'Perfect for individuals who want a simple way to track their daily expenses and manage their budget.',
    features: ['Expense Tracker', 'Budgeting Tools', 'Secure Data Encryption', 'Transaction History']
  },
  {
    name: 'Premium plan',
    icon: <Astronomy />,
    price: {
      monthly: 10.99,
      yearly: 9.99
    },
    description: 'For individuals who want a fully comprehensive solution to manage every aspect of their finances.',
    features: [
      'Everything in Pro Plan',
      'Unlimited Transactions',
      'Advanced Budgeting Features',
      'Financial Goal Tracking',
      'Tax Estimations & Savings Plans',
      '24/7 Premium Support'
    ],
    isHighlighted: true
  },
  {
    name: 'Pro plan',
    icon: <Messages />,
    price: {
      monthly: 15.99,
      yearly: 14.99
    },
    description: 'For those who want to go a step further with more in-depth budgeting and tracking features.',
    features: [
      'Everything in Basic Plan',
      'Customizable Expense Categories',
      'Spending Insights & Analytics',
      'Weekly Financial Reports'
    ],
    isLimited: true
  }
]
