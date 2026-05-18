'use client'

import { useState } from 'react'

import { MessageSquareMoreIcon, PlaneTakeoffIcon, CodeXmlIcon, MousePointerClickIcon } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { MotionPreset } from '@/components/ui/motion-preset'

const featureData = [
  {
    id: '1',
    title: 'Ready for Production',
    description:
      'Login is accessing an existing account, registration is creating a new one by providing necessary information.'
  },
  {
    id: '2',
    title: 'Clean Code',
    description: 'Our codebase follows best practices and is well-documented for easy maintenance.'
  },
  {
    id: '3',
    title: '1-Click Deployment',
    description: 'Deploy your application with a single click to your preferred hosting platform.'
  },
  {
    id: '4',
    title: 'Ready for Production',
    description:
      'Login is accessing an existing account, registration is creating a new one by providing necessary information.'
  },
  {
    id: '5',
    title: 'Clean Code',
    description: 'Our codebase follows best practices and is well-documented for easy maintenance.'
  },
  {
    id: '6',
    title: '1-Click Deployment',
    description: 'Deploy your application with a single click to your preferred hosting platform.'
  },
  {
    id: '7',
    title: 'Ready for Production',
    description:
      'Login is accessing an existing account, registration is creating a new one by providing necessary information.'
  },
  {
    id: '8',
    title: 'Clean Code',
    description: 'Our codebase follows best practices and is well-documented for easy maintenance.'
  },
  {
    id: '9',
    title: '1-Click Deployment',
    description: 'Deploy your application with a single click to your preferred hosting platform.'
  },
  {
    id: '10',
    title: 'Ready for Production',
    description:
      'Login is accessing an existing account, registration is creating a new one by providing necessary information.'
  },
  {
    id: '11',
    title: 'Clean Code',
    description: 'Our codebase follows best practices and is well-documented for easy maintenance.'
  },
  {
    id: '12',
    title: '1-Click Deployment',
    description: 'Deploy your application with a single click to your preferred hosting platform.'
  }
]

const AccordionWithImage = () => {
  const [activeAccordion, setActiveAccordion] = useState('production-ready')

  const handleAccordionChange = (value: string) => {
    setActiveAccordion(value)
  }

  const activeFeature = featureData.find(feature => feature.id === activeAccordion) || featureData[0]

  return (
    <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} delay={0.6} transition={{ duration: 0.5 }}>
      <div className='grid gap-20'>
        <div className='space-y-6'>
          <Accordion
            type='single'
            collapsible
            className='w-full space-y-2'
            value={activeAccordion}
            onValueChange={handleAccordionChange}
          >
            {featureData.map((item, index) => (
              <AccordionItem key={index} value={item.id} className='rounded-md border!'>
                <AccordionTrigger className='px-5'>
                  <span className='flex items-center gap-4'>
                    <span className='text-primary text-2xl lg:text-3xl'>{item.title}</span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className='text-muted-foreground px-5 text-base'>{item.description}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </MotionPreset>
  )
}

export default AccordionWithImage
