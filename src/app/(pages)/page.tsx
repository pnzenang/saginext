// import HeroSection from '@/components/blocks/hero-section/hero-section'

import Quote from '@/components/blocks/quote-section'
import Testimonials from '@/components/blocks/testimonials-section/testimonials-section'
import FAQ from '@/components/blocks/faq-section'
import { testimonialsData } from '@/assets/data/testimonials'
import { faqData } from '@/assets/data/faq-section'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-30/hero-section-30'
import { CheckSquareIcon, LockIcon, StarIcon, UsersIcon } from 'lucide-react'
import SocialProof from '@/components/shadcn-studio/blocks/social-proof-08/social-proof-08'
import Pricing from '@/components/shadcn-studio/blocks/pricing-component-08/pricing-component-08'
import Team from '@/components/shadcn-studio/blocks/team-section-04/team-section-04'
import { stats, teamMembers, teamMembers2 } from '@/utils/constants'
import Team2 from '@/components/shadcn-studio/blocks/team-section-17/team-section-17'
import ContactUs from '@/components/shadcn-studio/blocks/contact-us-page-02/contact-us-page-02'
import AboutUs from '@/components/shadcn-studio/blocks/about-us-page-01/about-us-page-01'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`,
      name: 'Swipe',
      description:
        'Track expenses, manage budgets, and achieve your financial goals with Swipe - the app that puts you in control of your money.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      inLanguage: 'en-US'
    }
  ]
}

const Home = () => {
  return (
    <>
      <HeroSection testimonials={testimonials} />
      <AboutUs stats={stats} />
      <SocialProof features={features} />
      <Pricing pricingPlans={pricingPlans} />
      <Team teamMembers={teamMembers} />
      <Team2 teamMembers2={teamMembers2} />
      <Quote />
      <Testimonials testimonials={testimonialsData} />

      <FAQ faqItems={faqData} />
      <ContactUs />

      {/* <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      /> */}
    </>
  )
}

export default Home

const testimonials = [
  {
    name: 'Bill Bailey',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
    title: `In Unity there is strength;
We can move mountains when we're united and enjoy life -
Without unity we are victims. Stay united.`
  },
  {
    name: 'Martin Luther King Jr.',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    title: 'We must learn to live together as brothers or perish together as fools'
  },
  {
    name: 'Starhawk',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png',
    title: 'Solidarity is based on the principle that we are willing to put ourselves at risk to protect each other.'
  },
  {
    name: 'Samora Machel',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png',
    title: 'Solidarity is not an act of charity, but mutual aid between forces fighting for the same objective.'
  }
]

const achievementsList = [
  { number: '20+', description: 'Years of Valuable Experience' },
  { number: '70+', description: 'Successful Projects and Initiatives' },
  { number: '85+', description: 'Trusted Employees Network' },
  { number: '35+', description: 'Positive Customer Reviews' },
  { number: '15', description: 'Achieve Recognition and Awards' }
]

const features = [
  {
    icon: LockIcon,
    value: '$20,000',
    description: 'Payout per family after 1 year of membership'
  },
  {
    icon: CheckSquareIcon,
    value: '30 days ',
    description: 'Payout time after the family produces the necessary documentation'
  },
  {
    icon: UsersIcon,
    value: '$20',
    description: 'Max Monthly contribution per member'
  },
  {
    icon: StarIcon,
    value: '90%',
    description: 'Customer satisfaction rating'
  }
]

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
