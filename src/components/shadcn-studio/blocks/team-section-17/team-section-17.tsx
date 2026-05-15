import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { MotionPreset } from '@/components/ui/motion-preset'
import { Marquee } from '@/components/ui/marquee'

import { cn } from '@/lib/utils'

type TeamMember = {
  img: string
  name: string
  role: string
  bgClass: string
  imageClass: string
}[]

const Team2 = ({ teamMembers2 }: { teamMembers2: TeamMember }) => {
  return (
    <section className='relative overflow-hidden py-8 before:pointer-events-none before:absolute before:inset-0 before:size-full before:bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-105.png)] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-40 sm:py-16 lg:py-24 dark:before:bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-105-dark.png)] dark:before:opacity-30'>
      <div className='absolute top-0 left-1/2 size-160 -translate-x-1/2'>
        <img
          src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-106.png'
          alt='gradient bg'
          className='opacity-15 dark:opacity-25'
        />
      </div>
      <div className='mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6 lg:mb-24 lg:px-8'>
        <div className='mx-auto space-y-4 text-center'>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} blur transition={{ duration: 0.5 }} delay={0.1}>
            <Badge variant='outline' className='text-sm font-normal'>
              Meet our team
            </Badge>
          </MotionPreset>
          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
            delay={0.1}
          >
            Get to Know the People Behind the Progress
          </MotionPreset>
          <MotionPreset
            component='p'
            className='text-muted-foreground text-xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
            delay={0.2}
          >
            Driven by purpose, our team blends creativity, innovation, and expertise to shape remarkable outcomes.
          </MotionPreset>
          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} delay={0.3} transition={{ duration: 0.5 }}>
            <Button size='lg' className='rounded-lg text-base'>
              About Us
            </Button>
          </MotionPreset>
        </div>
      </div>
      <div className='space-y-8'>
        <MotionPreset fade blur delay={0.3} transition={{ duration: 0.5 }}>
          <Marquee pauseOnHover delay={0.9} duration={60} gap={2.8} className='h-24 p-0'>
            {teamMembers2.slice(0, 5).map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className={cn('flex items-center gap-6 rounded-full px-6 py-4', member.bgClass)}
              >
                {/* <img
                  src={member.img}
                  alt={member.name}
                  className={cn(
                    'border-background size-16 rounded-full border-[3.5px] object-cover shadow-lg',
                    member.imageClass
                  )}
                /> */}
                <div className='asd'>
                  <div className='text-lg font-semibold'>{member.name}</div>
                  <div className='text-muted-foreground text-sm'>{member.role}</div>
                </div>
              </div>
            ))}
          </Marquee>
        </MotionPreset>
        <MotionPreset fade blur delay={0.3} transition={{ duration: 0.5 }}>
          <Marquee reverse pauseOnHover delay={0.9} duration={60} gap={2.8} className='h-24 p-0'>
            {teamMembers2.slice(6, 10).map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className={cn('flex items-center gap-6 rounded-full px-6 py-4', member.bgClass)}
              >
                {/* <img
                  src={member.img}
                  alt={member.name}
                  className={cn(
                    'border-background size-16 rounded-full border-[3.5px] object-cover shadow-lg',
                    member.imageClass
                  )}
                /> */}
                <div className='asd'>
                  <div className='text-lg font-semibold'>{member.name}</div>
                  <div className='text-muted-foreground text-sm'>{member.role}</div>
                </div>
              </div>
            ))}
          </Marquee>
        </MotionPreset>
        <MotionPreset fade blur delay={0.3} transition={{ duration: 0.5 }}>
          <Marquee pauseOnHover delay={0.9} duration={60} gap={2.8} className='h-24 p-0'>
            {teamMembers2.slice(11, 15).map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className={cn('flex items-center gap-6 rounded-full px-6 py-4', member.bgClass)}
              >
                {/* <img
                  src={member.img}
                  alt={member.name}
                  className={cn(
                    'border-background size-16 rounded-full border-[3.5px] object-cover shadow-lg',
                    member.imageClass
                  )}
                /> */}
                <div className='asd'>
                  <div className='text-lg font-semibold'>{member.name}</div>
                  <div className='text-muted-foreground text-sm'>{member.role}</div>
                </div>
              </div>
            ))}
          </Marquee>
        </MotionPreset>
      </div>
    </section>
  )
}

export default Team2
