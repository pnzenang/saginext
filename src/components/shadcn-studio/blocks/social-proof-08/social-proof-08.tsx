import type { ComponentType } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { MotionPreset } from '@/components/ui/motion-preset'

type Features = {
  icon: ComponentType
  value: string
  description: string
}

const SocialProof = ({ features }: { features: Features[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='bg-muted mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid gap-16 lg:grid-cols-2'>
          <div>
            <div className='mb-10 space-y-4'>
              <MotionPreset
                component='h2'
                className='text-2xl font-semibold md:text-3xl lg:text-6xl'
                fade
                slide={{ direction: 'up', offset: 50 }}
                blur
                transition={{ duration: 0.5 }}
              >
                Stats that matter
              </MotionPreset>

              <MotionPreset
                component='p'
                className='text-muted-foreground text-xl'
                fade
                blur
                slide={{ direction: 'up', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
              >
                When it comes to performance, we deliver results, No detours, no compromises, no shenanigans.
              </MotionPreset>
            </div>

            <div className='space-y-10'>
              {features.map((feature, index) => (
                <MotionPreset
                  key={index}
                  className='flex items-center gap-5'
                  fade
                  blur
                  slide={{ direction: 'up', offset: 30 }}
                  delay={0.6 + index * 0.15}
                  transition={{ duration: 0.7 }}
                >
                  <Avatar className='size-13 rounded-md'>
                    <AvatarFallback className='bg-muted text-foreground rounded-md'>
                      <feature.icon />
                    </AvatarFallback>
                  </Avatar>
                  <div className='space-y-1.5'>
                    <p className='text-2xl font-medium'>{feature.value}</p>
                    <p className='text-muted-foreground text-xl'>{feature.description}</p>
                  </div>
                </MotionPreset>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <MotionPreset className='my-auto h-fit' fade delay={0.4} transition={{ duration: 1.5 }}>
            <img
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778934995/stats_un5hkj.svg'
              alt='Social Image'
              className='w-full rounded-md object-contain'
            />
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
