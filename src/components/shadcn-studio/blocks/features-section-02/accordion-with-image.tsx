'use client'

import { useState } from 'react'

import { MessageSquareMoreIcon, PlaneTakeoffIcon, CodeXmlIcon, MousePointerClickIcon } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { MotionPreset } from '@/components/ui/motion-preset'

const featureData = [
  {
    id: '1',
    title: 'What are the requirements for registration?',
    description:
      "To register a member, the member need to live in the USA, you must provide the member's full name, date of birth, country of residence, as it appears on the official documents and the name of the beneficiary."
  },
  {
    id: '2',
    title: 'Is there a limit to the number of members I can register?',
    description:
      'SAGI accepts individual registrations and group registrations, group, families or associations can be of any size, the only requirement is that the members are willing to participate to the program under SAGI terms and conditions.'
  },
  {
    id: '3',
    title: 'What is SAGI objective?',
    description: `SAGI’s objectives encompass:
- The creation of an electronic database comprising associations organized within the US.
-The dissemination of information to all member associations, through their respective presidents and delegates, in the event of the death of an individual member of a member association.
-The facilitation of repatriation or burial services for individuals who pass away while affiliated with SAGI member associations.
-The collection of contributions (donations) from each SAGI member association.
-The transfer of collected contributions to the designated funeral home, and to the beneficiary if a balance remains after administrative costs have been deducted.`
  },
  {
    id: '4',
    title: 'At what point can a member start participating in the program after registering?',
    description: `A SAGI membership is deemed “Vested” when the member has finished his probationary period, the registration is complete and the assignment and publication of a SAGI matriculation number via email is completed. SAGI reserves the discretion to accept or decline an association’s membership to SAGI; however, individuals may become members of SAGI Member Associations at the Association’s discretion. Any association member may voluntarily withdraw from SAGI by submitting a formal letter or email to the SAGI Bureau/Board. SAGI retains the authority to terminate the membership of any member or association whose conduct is deemed disruptive or destabilizing to the organization.`
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
                    <span className='text-primary text-xl lg:text-2xl'>{item.title}</span>
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
