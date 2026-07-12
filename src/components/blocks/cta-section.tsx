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
                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Ready to Join SAGI?</h2>
                <p className='text-muted-foreground mb-8 text-xl'>
                  Create your account to manage members, contributions, documents, and family support requests from one
                  organized dashboard.
                </p>
                <div className='flex flex-wrap items-center gap-6 max-lg:justify-center max-md:w-full max-md:flex-col'>
                  <Link
                    href='/sign-up'
                    className='bg-primary text-primary-foreground hover:bg-primary/90 flex w-50 items-center justify-center rounded-lg px-5 py-3 font-medium transition-colors'
                  >
                    Join SAGI
                  </Link>
                  <Link
                    href='/sign-in'
                    className='border-input bg-background hover:bg-muted flex w-50 items-center justify-center rounded-lg border px-5 py-3 font-medium transition-colors'
                  >
                    Member Login
                  </Link>
                </div>
              </div>
              <div className='flex flex-1 items-end justify-center'>
                <img
                  src='/images/cta-mobile.webp'
                  alt='SAGI member dashboard preview'
                  className='transition-transform duration-300 group-hover:scale-105 md:max-xl:w-100 dark:hidden'
                />
                <img
                  src='/images/cta-mobile-dark.webp'
                  alt='SAGI member dashboard preview'
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
