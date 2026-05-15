import type { Metadata } from 'next'

import HeroBadge from '@/components/shadcn-studio/blocks/hero-section-30/hero-badge'
import BlogSection from '@/components/blog/blog-section/blog-section'
import { getPosts } from '@/lib/posts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { PrimarySwipeButton } from '@/components/ui/swipe-button'
import LogoVector from '@/assets/svg/logo-vector'
import { MotionPreset } from '@/components/ui/motion-preset'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Practical insights and real stories to guide your product from vision to reality, ensuring a smooth transition through each development phase.',
  keywords: ['practical insights', 'product development', 'real stories'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog`
  }
}

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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL}#webpage`,
      name: 'Blog',
      description:
        'Practical insights and real stories to guide your product from vision to reality, ensuring a smooth transition through each development phase.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,
      isPartOf: {
        '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`
      },
      potentialAction: {
        '@type': 'ReadAction',
        target: [`${process.env.NEXT_PUBLIC_APP_URL}/blog`]
      }
    }
  ]
}

const BlogPage = async () => {
  const posts = await getPosts()

  return (
    <>
      {/* Header */}
      <section className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-10 text-center sm:py-12 lg:py-16'>
        <HeroBadge />
        <MotionPreset
          component='h1'
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={0.2}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='text-2xl font-semibold md:text-3xl lg:text-5xl'
        >
          Build Better Products with Insights & Inspiration.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={0.4}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='text-muted-foreground text-xl'
        >
          Practical insights and real stories to guide your product from vision to reality, ensuring a smooth transition
          through each development phase.
        </MotionPreset>
      </section>

      <BlogSection posts={posts} />

      <section className='bg-muted py-8 sm:py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <Card className='group overflow-hidden rounded-4xl border-none pt-8 pb-0 shadow-none md:pt-16'>
            <CardContent className='grid grid-cols-1 gap-16 px-6 max-lg:text-center md:px-20 lg:grid-cols-2'>
              <div className='col-span-1 flex-1 space-y-4 md:pb-16'>
                <Badge className='border-primary text-primary px-3 py-1 text-sm [&>svg]:size-6' variant='outline'>
                  <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> Sign in
                </Badge>
                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
                  Smarter Money Decisions Start With Better Insights
                </h2>
                <p className='text-muted-foreground mb-8 text-xl'>
                  Learn how to track spending, build better budgeting habits, and reach your savings goals through
                  practical tips, real-life examples, and simple financial guidance.
                </p>
                <form className='flex gap-3 max-lg:justify-center max-md:flex-col'>
                  <Input
                    type='email'
                    placeholder='Your email'
                    name='email'
                    className='w-full rounded-full md:max-w-72'
                    required
                  />
                  <PrimarySwipeButton>Get Money Tips</PrimarySwipeButton>
                </form>
              </div>
              <div className='col-span-1 flex flex-1 items-end justify-center'>
                <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
                  <img
                    src='/images/cta-mobile.webp'
                    alt='Swipe App Interface'
                    className='transition-transform duration-300 group-hover:scale-105 dark:hidden'
                  />
                  <img
                    src='/images/cta-mobile-dark.webp'
                    alt='Swipe App Interface'
                    className='hidden transition-transform duration-300 group-hover:scale-105 dark:block'
                  />
                </MotionPreset>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add JSON-LD to your page */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
    </>
  )
}

export default BlogPage
