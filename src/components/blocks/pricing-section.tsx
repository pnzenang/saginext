'use client'

import { useState } from 'react'

import { CheckIcon, FlameIcon } from 'lucide-react'

import LogoVector from '@/assets/svg/logo-vector'

import { Badge } from '@/components/ui/badge'
import { PrimarySwipeButton, SecondarySwipeButton } from '@/components/ui/swipe-button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

import type { PricingPlan } from '@/assets/data/pricing-section'

import { NumberTicker } from '@/components/ui/number-ticker'

type PricingProps = {
  plans: PricingPlan[]
}

const PricingSection = ({ plans }: PricingProps) => {
  const [billingPeriod, setBillingPeriod] = useState('yearly')

  return (
    <section id='pricing' className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 text-center'>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }}>
            <Badge className='border-primary text-primary px-3 py-1 text-sm uppercase [&>svg]:size-6' variant='outline'>
              <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> Pricing
            </Badge>
          </MotionPreset>

          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.2}
            transition={{ duration: 0.7 }}
          >
            Choose the Right Plan for You
          </MotionPreset>

          <MotionPreset
            component='p'
            className='text-muted-foreground text-xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.4}
            transition={{ duration: 0.7 }}
          >
            Flexible pricing designed to fit your lifestyle. Only pay for the features you need.
          </MotionPreset>
        </div>

        {/* Billing Period Toggle */}
        <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.6} transition={{ duration: 0.7 }}>
          <div className='relative flex items-center justify-center gap-2'>
            <Tabs
              value={billingPeriod === 'yearly' ? 'yearly' : 'monthly'}
              onValueChange={value => setBillingPeriod(value)}
              className='bg-muted rounded-full p-0.75'
            >
              <TabsList className='h-auto bg-transparent p-0'>
                <TabsTrigger
                  value='monthly'
                  aria-hidden='true'
                  className='data-[state=active]:bg-background data-[state=active]:text-muted dark:data-[state=active]:text-muted dark:data-[state=active]:bg-background cursor-pointer rounded-full px-3 py-1 data-[state=active]:shadow-sm dark:data-[state=active]:border-transparent'
                >
                  <span className='text-foreground text-sm font-medium'>Monthly</span>
                </TabsTrigger>
                <TabsTrigger
                  value='yearly'
                  aria-hidden='true'
                  className='data-[state=active]:bg-background data-[state=active]:text-muted dark:data-[state=active]:text-muted dark:data-[state=active]:bg-background cursor-pointer rounded-full px-3 py-1 data-[state=active]:shadow-sm dark:data-[state=active]:border-transparent'
                >
                  <span className='text-foreground text-sm font-medium'>Yearly</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className='absolute top-10 left-1/2 flex translate-x-[50%] items-center gap-2'>
              <svg xmlns='http://www.w3.org/2000/svg' width='43' height='16' viewBox='0 0 43 16' fill='none'>
                <path
                  d='M42.1335 11.9671C42.6519 11.7765 42.9177 11.2018 42.7271 10.6835C42.5366 10.1651 41.9619 9.89931 41.4435 10.0898L41.7885 11.0284L42.1335 11.9671ZM0.998363 0.0133701C0.446081 0.0141978 -0.000963609 0.462583 -0.000137746 1.01487L0.0133383 10.0149C0.0141645 10.5671 0.462549 11.0142 1.01483 11.0134C1.56712 11.0125 2.01416 10.5641 2.01333 10.0119L2.00136 2.01187L10.0013 1.99989C10.5536 1.99907 11.0007 1.55068 10.9999 0.998398C10.999 0.446113 10.5506 -0.000930369 9.99835 -0.000104239L0.998363 0.0133701ZM41.7885 11.0284L41.4435 10.0898C28.6721 14.7842 19.6334 13.1521 13.3858 10.0167C7.06682 6.84552 3.55105 2.14483 1.70591 0.305204L0.999862 1.01337L0.293814 1.72153C1.92934 3.35217 5.79171 8.44333 12.4888 11.8043C19.2573 15.201 28.8725 16.8413 42.1335 11.9671L41.7885 11.0284Z'
                  fill='var(--border)'
                />
              </svg>
              <Badge className='border-none bg-sky-600/10 text-sky-600 focus-visible:ring-sky-600/20 focus-visible:outline-none dark:focus-visible:ring-sky-600/40 [a&]:hover:bg-sky-600/20'>
                10% off
              </Badge>
            </div>
          </div>
        </MotionPreset>

        {/* Pricing Cards */}
        <div className='flex flex-col items-center justify-center gap-0 space-y-8 lg:flex-row'>
          {plans.map((plan, index) => {
            return (
              <MotionPreset
                key={index}
                fade
                blur
                slide={{ direction: 'down', offset: 15 }}
                delay={0.8 + index * 0.15}
                transition={{ duration: 0.5 }}
                className='max-w-lg flex-1'
              >
                <Card
                  key={index}
                  className={cn('bg-card/50 py-8 shadow-none', {
                    'bg-card': plan.isHighlighted,
                    'lg:rounded-r-none lg:border-r-0': index === 0, // Remove right border and radius for the left card
                    'lg:rounded-l-none lg:border-l-0': index === 2 // Remove left border and radius for the right card
                  })}
                >
                  <CardContent className='flex flex-col gap-8'>
                    <div className='flex flex-col gap-4'>
                      {/* Icon */}
                      <div className='bg-primary/10 flex size-11.5 items-center justify-center rounded-md p-1'>
                        {plan.icon}
                      </div>

                      <div className='space-y-1.5'>
                        {/* Plan Name */}
                        <div className='flex items-center gap-3.5'>
                          <h3 className='text-2xl font-semibold'>{plan.name}</h3>
                          {plan.isHighlighted && (
                            <Badge
                              variant='outline'
                              className='text-destructive [a&]:hover:bg-destructive/10 [a&]:hover:text-destructive/90 border-destructive flex items-center gap-1 rounded-full'
                            >
                              <FlameIcon className='size-3' />
                              Popular
                            </Badge>
                          )}
                          {plan.isLimited && (
                            <>
                              {/* Availability Badge */}
                              <div className='flex items-center gap-1.5 text-xs font-medium'>
                                <span className='relative flex size-2'>
                                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75 dark:bg-green-400'></span>
                                  <span className='relative inline-flex size-2 rounded-full bg-green-600 dark:bg-green-400'></span>
                                </span>
                                Limited availability
                              </div>
                            </>
                          )}
                        </div>
                        {/* Description */}
                        <p className='text-muted-foreground'>{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className='flex items-baseline gap-1.5'>
                        <span className='text-xl font-semibold md:text-2xl lg:text-4xl'>
                          $
                          <NumberTicker
                            value={billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly}
                            decimalPlaces={2}
                          />
                        </span>
                        <span
                          className={cn('text-muted-foreground', {
                            'text-foreground': plan.isHighlighted
                          })}
                        >
                          /month
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-col gap-2.5'>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className='flex items-center gap-2 py-1'>
                          <div
                            className={cn('flex size-4.5 items-center justify-center rounded-full border p-0.5', {
                              'bg-background': plan.isHighlighted
                            })}
                          >
                            <CheckIcon className='size-3' />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!plan.isHighlighted && (
                      <SecondarySwipeButton size='lg' className='rounded-full'>
                        See pricing
                      </SecondarySwipeButton>
                    )}
                    {plan.isHighlighted && (
                      <PrimarySwipeButton size='lg' className='rounded-full'>
                        See pricing
                      </PrimarySwipeButton>
                    )}
                  </CardContent>
                </Card>
              </MotionPreset>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
