import type { ComponentType } from 'react'

import { ArrowRightIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

type Features = {
  icon: ComponentType
  title: string
  description: string
  cardBorderColor: string
  avatarTextColor: string
  avatarBgColor: string
}[]

const Features = ({ featuresList }: { featuresList: Features }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 space-y-4 sm:mb-8 lg:mb-10'>
          <h2 className='text-center text-2xl font-semibold md:text-3xl lg:text-4xl'>NAVIGATION INSTRUCTIONS</h2>
          <p className='text-muted-foreground text-center text-xl'>
            Here, you will see the instructions on how and where to go for each SAGI transaction such as adding member,
            removing member etc.
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {featuresList.map((features, index) => (
            <Card key={index} className={cn('shadow-none transition-colors duration-300', features.cardBorderColor)}>
              <CardContent>
                <Avatar className='mb-6 size-10 rounded-md'>
                  <AvatarFallback
                    className={cn('rounded-md [&>svg]:size-6', features.avatarBgColor, features.avatarTextColor)}
                  >
                    <features.icon />
                  </AvatarFallback>
                </Avatar>
                <h6 className='mb-2 text-lg font-semibold'>{features.title}</h6>
                <p className='text-muted-foreground'>{features.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
