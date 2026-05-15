'use client'

import { Fragment, useEffect, useState } from 'react'

import { FacebookIcon, GithubIcon, InstagramIcon, TwitterIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'

import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

type TeamSectionProps = {
  img: string
  buttonImg: string
  name: string
  title: string
  colorClass: string
  iconColorClass: string
  description: string
  facebookLink: string
  twitterLink: string
  githubLink: string
  instagramLink: string
}

const Team = ({ teamdata }: { teamdata: TeamSectionProps[] }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Sync carousel with thumbnail selection
  useEffect(() => {
    if (!api) return

    api.scrollTo(selectedImage)
  }, [api, selectedImage])

  // Update selectedImage when carousel changes
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap()

      setSelectedImage(currentIndex)
      setCurrent(currentIndex)
    }

    api.on('select', onSelect)
    onSelect()

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <section className='before:from-primary/10 before:transparent relative min-h-screen pt-8 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:h-60 before:w-full before:bg-linear-to-b before:via-transparent sm:pt-16 lg:pt-24'>
      {teamdata.map(member => (
        <Fragment key={member.name}>
          <img src={member.img} alt={member.name} className='hidden' fetchPriority='high' />
        </Fragment>
      ))}

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 max-w-4xl space-y-4 sm:mb-16 lg:mb-24'>
          <MotionPreset fade slide blur transition={{ duration: 0.5 }} delay={0.2}>
            <Badge variant='outline' className='relative text-sm font-normal'>
              Meet our team
            </Badge>
          </MotionPreset>
          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide
            blur
            transition={{ duration: 0.5 }}
            delay={0.3}
          >
            Where Collaboration Meets Creativity Introducing the People Behind Our Progress
          </MotionPreset>
          <MotionPreset
            component='p'
            className='text-muted-foreground text-xl'
            fade
            slide
            blur
            transition={{ duration: 0.5 }}
            delay={0.5}
          >
            Driven by purpose, our team blends creativity, innovation, and expertise to shape remarkable outcomes.
          </MotionPreset>
        </div>
        {/* Team Members */}
        <Carousel
          className='-mt-10 w-full'
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true
          }}
        >
          <CarouselContent className='pt-10'>
            {teamdata.map((member, index) => {
              const isActive = current === index

              return (
                <CarouselItem
                  key={`${member.name}-${index}`}
                  className='flex justify-between gap-6 max-lg:flex-col max-lg:items-center'
                >
                  <div className='w-full max-w-138 space-y-5'>
                    <div className='space-y-2'>
                      {isActive && (
                        <MotionPreset
                          component='h2'
                          className='text-5xl font-medium'
                          fade
                          slide={{ direction: 'down', offset: 60 }}
                          blur
                          transition={{ duration: 0.5 }}
                          delay={0.6}
                        >
                          {member.name}
                        </MotionPreset>
                      )}
                      {isActive && (
                        <MotionPreset
                          component='p'
                          className='text-muted-foreground text-xl font-medium'
                          fade
                          slide={{ direction: 'down', offset: 60 }}
                          blur
                          transition={{ duration: 0.5 }}
                          delay={0.8}
                        >
                          {member.title}
                        </MotionPreset>
                      )}
                    </div>
                    {isActive && (
                      <MotionPreset
                        fade
                        slide={{ direction: 'down', offset: 60 }}
                        blur
                        transition={{ duration: 0.5 }}
                        delay={1}
                      >
                        <div className='flex items-center gap-3'>
                          <a href={member.facebookLink}>
                            <FacebookIcon className='size-5.5 shrink-0' />
                          </a>
                          <a href={member.twitterLink}>
                            <TwitterIcon className='size-5.5 shrink-0' />
                          </a>
                          <a href={member.githubLink}>
                            <GithubIcon className='size-5.5 shrink-0' />
                          </a>
                          <a href={member.instagramLink}>
                            <InstagramIcon className='size-5.5 shrink-0' />
                          </a>
                        </div>
                      </MotionPreset>
                    )}
                    {isActive && (
                      <MotionPreset
                        component='p'
                        className='text-muted-foreground font-normal'
                        fade
                        slide={{ direction: 'down', offset: 60 }}
                        blur
                        transition={{ duration: 0.5 }}
                        delay={1}
                      >
                        {member.description}
                      </MotionPreset>
                    )}
                  </div>
                  {isActive && (
                    <MotionPreset
                      component='div'
                      fade
                      slide={{ direction: 'down', offset: 60 }}
                      blur
                      transition={{ duration: 0.5 }}
                      delay={1}
                      className={cn('relative size-full max-w-104 rounded-md max-lg:mt-4', member.colorClass)}
                    >
                      <div className={cn('absolute -top-8 left-0 sm:-left-8', member.iconColorClass)}>
                        <svg width='68' height='68' viewBox='0 0 68 68' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M63.5958 3.5957C47.0245 3.5957 33.5958 17.0244 33.5958 33.5957C33.5958 17.0244 20.1672 3.5957 3.59584 3.5957C3.59584 20.1671 17.0245 33.5957 33.5958 33.5957C17.0245 33.5957 3.59584 47.0244 3.59584 63.5957C20.1672 63.5957 33.5958 50.1671 33.5958 33.5957C33.5958 50.1671 47.0245 63.5957 63.5958 63.5957C63.5958 47.0244 50.1672 33.5957 33.5958 33.5957C50.1672 33.5957 63.5958 20.1671 63.5958 3.5957Z'
                            fill='CurrentColor'
                            fillOpacity='0.4'
                          />
                          <path
                            d='M67.1917 33.5958C57.9129 24.317 42.8746 24.3169 33.5958 33.5957C42.8746 24.3169 42.8746 9.27881 33.5958 0C24.317 9.27881 24.317 24.3169 33.5958 33.5957C24.317 24.3169 9.27881 24.317 0 33.5958C9.27881 42.8746 24.317 42.8745 33.5958 33.5957C24.317 42.8745 24.317 57.9129 33.5958 67.1917C42.8746 57.9129 42.8746 42.8745 33.5958 33.5957C42.8746 42.8745 57.9129 42.8746 67.1917 33.5958Z'
                            fill='CurrentColor'
                          />
                        </svg>
                      </div>
                      <img src={member.img} alt={member.name} className='size-full rounded-xl object-contain' />
                    </MotionPreset>
                  )}
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
      <MotionPreset
        fade
        slide={{ direction: 'down', offset: 50 }}
        blur
        transition={{ duration: 0.5 }}
        delay={0.5}
        className='bg-background -mt-10 overflow-y-auto border-t p-5'
      >
        <div className='mx-auto flex h-full w-fit justify-center gap-4 md:gap-10 xl:gap-16'>
          {teamdata.map((member, index) => (
            <button
              type='button'
              key={`${member.name}-${index}`}
              onClick={() => setSelectedImage(index)}
              className={cn(
                'transition-color flex h-37.5 w-45.5 flex-col items-center justify-center overflow-hidden rounded-md border border-transparent p-4 duration-200',
                selectedImage === index ? 'border-primary/40' : null
              )}
            >
              <div className={cn('mb-1 size-16 rounded-full', member.colorClass)}>
                <img src={member.buttonImg} alt={member.name} className='size-16 rounded-full object-contain' />
              </div>
              <h4 className='text-lg font-semibold'>{member.name}</h4>
              <p className='text-muted-foreground text-sm'>{member.title}</p>
            </button>
          ))}
        </div>
      </MotionPreset>
    </section>
  )
}

export default Team
