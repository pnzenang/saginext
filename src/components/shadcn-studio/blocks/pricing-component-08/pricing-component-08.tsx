'use client'

import { useEffect } from 'react'

import { CircleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

type PricingPlans = {
  name: string
  price: number
  description: string
  buttonText: string
  features: string[]
}[]

const Pricing = ({ pricingPlans }: { pricingPlans: PricingPlans }) => {
  useEffect(() => {
    const all = document.querySelectorAll('.card')

    const handleMouseMove = (ev: MouseEvent) => {
      all.forEach(e => {
        const blob = e.querySelector('.blob') as HTMLElement
        const fblob = e.querySelector('.fake-blob') as HTMLElement

        if (!blob || !fblob) return

        const rec = fblob.getBoundingClientRect()

        blob.style.opacity = '0.8'

        blob.animate(
          [
            {
              transform: `translate(${
                ev.clientX - rec.left - 24 - rec.width / 2
              }px, ${ev.clientY - rec.top - 24 - rec.height / 2}px)`
            }
          ],
          {
            duration: 300,
            fill: 'forwards'
          }
        )
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-col gap-0.5 text-center'>
            <h2 className='text-2xl font-semibold sm:text-4xl lg:text-6xl'>
              3 Simple but consequential members' status
            </h2>
          </div>
          <p className='text-muted-foreground text-center text-xl font-normal'>
            A Comprehensive Breakdown of Our member's Status and Their Unique Benefits and Obligations.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {pricingPlans.map((plan, index) => {
            // Conditionally set the button variant based on the plan
            const buttonVariant = plan.name === 'Vested' ? 'default' : 'outline'

            return (
              <div
                className={cn(
                  'bg-green/10 card group relative h-full overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out max-lg:last:col-span-full',
                  { 'p-0': plan.name === 'Vested' }
                )}
                key={index}
              >
                <Card
                  className={cn('group-hover:bg-card/90 h-full shadow-none transition-all duration-300 ease-in-out', {
                    'border-primary border-2': plan.name === 'Vested'
                  })}
                >
                  <CardContent className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-6'>
                      <h3 className='text-3xl font-black'>{plan.name}</h3>

                      <p className='text-base font-normal'>{plan.description}</p>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className='flex items-center gap-2 py-1'>
                          <CircleIcon className='size-3' />
                          <span className='text-base font-normal'>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className='blob bg-primary absolute top-0 left-0 -z-1 size-62.5 rounded-full opacity-0 blur-2xl transition-all duration-300 ease-in-out' />
                <div className='fake-blob absolute top-0 left-0 -z-1 [display:hidden] size-40 rounded-full' />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Pricing
