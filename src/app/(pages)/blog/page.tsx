import type { Metadata } from 'next'

import HeroBadge from '@/components/shadcn-studio/blocks/hero-section-30/hero-badge'
import BlogSection from '@/components/blog/blog-section/blog-section'
import { getPosts } from '@/lib/posts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

import { PrimarySwipeButton } from '@/components/ui/swipe-button'
import LogoVector from '@/assets/svg/logo-vector'
import { MotionPreset } from '@/components/ui/motion-preset'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'SAGI resources for member registration, contribution responsibilities, and family support guidance.',
  keywords: ['SAGI resources', 'mutual aid guidance', 'funeral support', 'member registration'],
  alternates: {
    canonical: '/blog'
  },
  robots: {
    index: false,
    follow: true
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      inLanguage: 'en-US'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog#webpage`,
      name: 'SAGI Resources',
      description:
        'SAGI resources for member registration, contribution responsibilities, and family support guidance.',
      url: `${siteUrl}/blog`,
      isPartOf: {
        '@id': `${siteUrl}#website`
      },
      potentialAction: {
        '@type': 'ReadAction',
        target: [`${siteUrl}/blog`]
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
          SAGI Resources and Member Guidance.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={0.4}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='text-muted-foreground text-xl'
        >
          Practical guidance for member registration, contribution responsibilities, family support rules, and delegate
          coordination.
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
                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Need Help With SAGI?</h2>
                <p className='text-muted-foreground mb-8 text-xl'>
                  Send us your question and the SAGI team will help with registration, member status, contribution, or
                  support documentation questions.
                </p>
                <form className='flex gap-3 max-lg:justify-center max-md:flex-col'>
                  <Input
                    type='email'
                    placeholder='Your email'
                    name='email'
                    className='w-full rounded-full md:max-w-72'
                    required
                  />
                  <PrimarySwipeButton>Contact SAGI</PrimarySwipeButton>
                </form>
              </div>
              <div className='col-span-1 flex flex-1 items-end justify-center'>
                <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
                  <img
                    src='/images/cta-mobile.webp'
                    alt='SAGI member dashboard preview'
                    className='transition-transform duration-300 group-hover:scale-105 dark:hidden'
                  />
                  <img
                    src='/images/cta-mobile-dark.webp'
                    alt='SAGI member dashboard preview'
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
