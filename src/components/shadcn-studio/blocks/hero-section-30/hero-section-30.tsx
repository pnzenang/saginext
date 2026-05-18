import Users from '@/assets/svg/users'
import Medal from '@/assets/svg/medal'
import Support from '@/assets/svg/support'
import { Card, CardContent } from '@/components/ui/card'

import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'

import HeroBadge from '@/components/shadcn-studio/blocks/hero-section-30/hero-badge'

const features = [
  { img: <Users />, label: 'Trusted by 5,000+ clients' },
  { img: <Medal />, label: 'Projects delivered with excellence' },
  { img: <Support />, label: 'Verified top-rated freelancers' }
]

type Testimonial = {
  name: string
  avatar: string
  title: string
}

const HeroSection = ({ testimonials }: { testimonials: Testimonial[] }) => {
  return (
    <section className='flex-1 py-4 sm:py-16 lg:py-16'>
      {/* <BackgroundRippleEffect cellSize={60} rows={11} cols={32} /> */}
      <div
        className='mx-auto flex max-w-7xl flex-col items-center gap-8 rounded-xl bg-cover bg-center px-4 sm:gap-16 sm:px-6 lg:gap-24 lg:px-8'
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dp8tkb7hq/image/upload/v1779077351/mourning_fdgbjz.svg')"
        }}
      >
        {/* <div className='absolute inset-0 bg-black/50'></div> */}
        {/* Hero Content */}
        <div className='relative flex flex-col items-center gap-8 text-center'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='z-10'
            >
              <HeroBadge />
            </MotionPreset>

            <MotionPreset
              component='h1'
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.3}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='z-10 text-2xl font-bold text-white sm:text-3xl lg:text-5xl lg:font-bold'
            >
              <span className='text-primary'>SAGI:</span> Active Solidarity Ltd.
            </MotionPreset>

            <MotionPreset
              component='p'
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.5}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='z-10 max-w-5xl py-12 text-xl text-white sm:text-2xl lg:py-16 lg:text-3xl'
            >
              Join the most cost effective mutual aid community in the USA. With SAGI, you save money while gaining
              access to a network of support and solidarity with low overhead expenses and big benefits.
              <span className='hidden sm:block'>
                Experience the power of collective support, where your contribution creates a safety net for you and
                your family.
              </span>
            </MotionPreset>
          </div>
        </div>
      </div>

      <MotionPreset
        component='div'
        fade
        blur
        slide={{ direction: 'down', offset: 30 }}
        transition={{ duration: 0.45 }}
        delay={1.1}
        className='relative z-10 mt-6 max-w-full overflow-hidden sm:mt-8 lg:mt-10'
      >
        <Marquee pauseOnHover duration={50} gap={1.5} className='pb-5'>
          {testimonials.map((testimonial, index) => (
            <Card key={index} className='max-w-md transition-shadow duration-500 hover:shadow-xl'>
              <CardContent className='flex gap-6 sm:items-center'>
                <div className='flex-1 space-y-2'>
                  <p className='-mb-3 text-3xl'>&ldquo;</p>
                  <h3 className='text-lg font-medium'>{testimonial.title}</h3>
                  <h4 className='text-muted-foreground text-sm'>{testimonial.name}</h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </Marquee>
      </MotionPreset>
    </section>
  )
}

export default HeroSection
