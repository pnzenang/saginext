import Pricing from '@/components/shadcn-studio/blocks/pricing-component-08/pricing-component-08'

const pricingPlans = [
  {
    name: 'Starter',
    price: 99,
    description: 'Recommended for people with at least 1 year experience in crypto markets.',
    buttonText: 'Starter',
    features: [
      '1 user account',
      '24 transaction per month',
      '16 altcoin pairs',
      'Basic AI analysis of markets',
      'Build-in wallet API for your crypto'
    ]
  },
  {
    name: 'Professional',
    price: 199,
    description: 'Best for large business owners, startups who need a landing page for their business.',
    buttonText: 'Professional',
    features: [
      '1 user account',
      'Unlimited transactions per month',
      'Unlimited altcoin pairs',
      'Advanced AI analysis of markets',
      'Build-in wallet API for your crypto'
    ]
  },
  {
    name: 'Enterprise',
    price: 299,
    description: 'Best for large business owners, startups who need a landing page for their business.',
    buttonText: 'Enterprise',
    features: [
      'Unlimited users account',
      'Unlimited transactions per month',
      'Unlimited altcoin pairs',
      'Advanced AI analysis of market by expert',
      'Build-in wallet API for your crypto'
    ]
  }
]

const PricingPage = () => {
  return <Pricing pricingPlans={pricingPlans} />
}

export default PricingPage
