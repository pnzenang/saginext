import ChecklistMinimalistic from '@/assets/svg/checklist-minimalistic'
import PhoneNotification from '@/assets/svg/phone-notification'
import Target from '@/assets/svg/target'
import UserId from '@/assets/svg/user-id'
import UsersArrow from '@/assets/svg/users-arrow'

export const FeaturesData = [
  {
    id: 'personalized-budgeting',
    icon: <UserId />,
    title: 'Personalized Budgeting',
    description:
      'Set budgets tailored to your needs and stay on track with smart suggestions. This way, you can ensure your financial goals are met effectively.',
    position: 'left' as const
  },
  {
    id: 'smart-expense-tracking',
    icon: <ChecklistMinimalistic />,
    title: 'Smart Expense Tracking',
    description:
      'Track every purchase effortlessly and understand your spending habits in real-time. This way, you can make informed decisions about your finances.',
    position: 'right' as const
  },
  {
    id: 'seamless-transactions',
    icon: <UsersArrow />,
    title: 'Seamless Transactions',
    description:
      'Send and receive money securely, instantly, with just a few taps. Enjoy the convenience of managing your finances right from your device.',
    position: 'left' as const
  },
  {
    id: 'goal-oriented-savings',
    icon: <Target />,
    title: 'Goal-Oriented Savings',
    description:
      'Easily save for what matters most, with automatic tracking and reminders. This feature helps you stay committed to your savings goals and receive timely notifications to ensure you never miss a chance to save.',
    position: 'right' as const
  },
  {
    id: 'instant-financial-insights',
    icon: <PhoneNotification />,
    title: 'Instant Financial Insights',
    description:
      'Get actionable insights into your spending, saving, and financial progress. This will help you make informed decisions about your money.',
    position: 'left' as const
  }
]
