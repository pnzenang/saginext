import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import LogoVector from '@/assets/svg/logo-vector'

const CTASection = () => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card className='group overflow-hidden rounded-4xl border-none pt-8 pb-0 shadow-none md:pt-16'>
            <CardContent className='flex gap-16 px-6 max-xl:flex-col max-lg:text-center md:px-20'>
              <div className='flex-1 space-y-4 md:pb-16'>
                <Badge className='border-primary text-primary px-3 py-1 text-sm [&>svg]:size-6' variant='outline'>
                  <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> Try now
                </Badge>
                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
                  Ready to Take Control of Your Finances?
                </h2>
                <p className='text-muted-foreground mb-8 text-xl'>
                  Start managing your money with ease. Sign up today and get instant access to all the tools you need to
                  track your expenses, set budgets, and make smarter financial decisions.
                </p>
                <div className='flex flex-wrap items-center gap-6 max-lg:justify-center max-md:w-full max-md:flex-col'>
                  <Link
                    href='#'
                    className='flex w-50 items-center gap-4 rounded-lg bg-black px-5 py-1.75 text-white dark:bg-white dark:text-black'
                  >
                    <img src='/images/apple-icon.webp' alt='App Store' className='size-8.5 invert dark:invert-0' />
                    <div className='flex flex-col items-start'>
                      <p className='text-xs leading-4'>Download on the</p>
                      <p className='text-base leading-6 font-medium opacity-90'>App Store</p>
                    </div>
                  </Link>
                  <Link
                    href='#'
                    className='flex w-50 items-center gap-4 rounded-lg bg-black px-5 py-1.75 text-white dark:bg-white dark:text-black'
                  >
                    <img src='/images/google-play-icon.webp' alt='Google Play' className='size-8.5' />
                    <div className='flex flex-col items-start'>
                      <p className='text-xs leading-4'>Download on the</p>
                      <p className='text-base leading-6 font-medium opacity-90'>Google Play</p>
                    </div>
                  </Link>
                </div>
              </div>
              <div className='flex flex-1 items-end justify-center'>
                <img
                  src='/images/cta-mobile.webp'
                  alt='Swipe App Interface'
                  className='transition-transform duration-300 group-hover:scale-105 md:max-xl:w-100 dark:hidden'
                />
                <img
                  src='/images/cta-mobile-dark.webp'
                  alt='Swipe App Interface'
                  className='hidden transition-transform duration-300 group-hover:scale-105 md:max-xl:w-100 dark:block'
                />
              </div>
            </CardContent>
          </Card>
        </MotionPreset>
      </div>
    </section>
  )
}

export default CTASection
