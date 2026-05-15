import Link from 'next/link'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'

import HeroBadge from '@/components/shadcn-studio/blocks/hero-section-30/hero-badge'

const HeroSection = () => {
  return (
    <section
      id='home'
      className='relative -mt-20 overflow-hidden bg-[url(/images/bg-pattern.webp)] pt-28 sm:pt-36 lg:pt-44'
    >
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:gap-16 sm:px-6 lg:gap-24 lg:px-8'>
        {/* Hero Content */}
        <div className='flex flex-col items-center gap-4 text-center'>
          <HeroBadge />
          <MotionPreset
            component='h1'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.2}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='text-2xl font-semibold sm:text-3xl lg:text-6xl'
          >
            <span className='text-primary font-bold'>SAGI:</span> Active Solidarity Ltd.
          </MotionPreset>
          <MotionPreset
            component='p'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.4}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='text-muted-foreground max-w-4xl text-xl'
          >
            Join the most cost effective mutual aid community in the USA. With SAGI, you save money while gaining access
            to a network of support and solidarity. The overhead expenses are low, the benefits are high, and the
            community is strong. Experience the power of collective support with SAGI, where your contribution creates a
            safety net for you and your family.
          </MotionPreset>
          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.6}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='flex flex-wrap items-center gap-4'
          >
            <Link
              href='/#join'
              className='bg-primary hover:bg-primary/90 focus:ring-primary/50 inline-flex items-center gap-2 rounded-full px-6 py-3 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none'
            >
              Join Now
            </Link>
          </MotionPreset>
        </div>

        <div className='from-background absolute inset-x-0 bottom-0 h-16 bg-linear-to-t to-transparent' />
      </div>

      {/* Background Marquee */}
      <Marquee duration={50} gap={0} className='absolute inset-0 -z-1 p-0'>
        <img src='/images/cloud-image.webp' alt='Cloud image' className='inset-0 opacity-60 dark:hidden' />

        <img
          src='/images/cloud-image-dark.webp'
          alt='Cloud image dark'
          className='inset-0 hidden opacity-40 dark:inline-block'
        />
      </Marquee>
    </section>
  )
}

export default HeroSection
