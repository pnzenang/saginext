import Link from 'next/link'

import { ArrowDownIcon, ArrowRightIcon } from 'lucide-react'

import { Accordion as AccordionPrimitive } from 'radix-ui'

import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { PrimarySwipeButton } from '@/components/ui/swipe-button'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'

import LogoVector from '@/assets/svg/logo-vector'

type FAQItem = {
  question: string
  answer: string
}

type FAQComponentProps = {
  faqItems: FAQItem[]
  copy?: {
    badge: string
    title: string
    description: string
    cardTitle: string
    cardDescription: string
    contactCta: string
  }
}

const defaultCopy = {
  badge: 'FAQ',
  title: 'Have more questions?',
  description:
    'SAGI combines mutual aid, clear member rules, and a self-service dashboard so delegates and families know what to expect before support is needed.',
  cardTitle: "Can't find answers?",
  cardDescription: "We're here to help with registration, member status, documents, and funeral support questions.",
  contactCta: 'Contact us'
}

const FAQ = ({ faqItems, copy = defaultCopy }: FAQComponentProps) => {
  return (
    <section id='faq' className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-2 lg:gap-24'>
          {/* Left Section - Support Card */}
          <div className='flex flex-col justify-between'>
            <div className='mb-12 space-y-4 sm:mb-16 lg:mb-24'>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }}>
                <Badge className='border-primary text-primary px-3 py-1 text-sm [&>svg]:size-6' variant='outline'>
                  <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> {copy.badge}
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
                {copy.title}
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.4} transition={{ duration: 0.7 }}>
                <p className='text-muted-foreground text-base leading-relaxed'>
                  {copy.description}
                </p>
              </MotionPreset>
            </div>
            <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.5} transition={{ duration: 0.7 }}>
              <Card>
                <CardContent className='space-y-6'>
                  <div className='space-y-2.5'>
                    <h3 className='text-xl font-medium md:text-2xl'>{copy.cardTitle}</h3>
                    <p className='text-muted-foreground leading-relaxed'>
                      {copy.cardDescription}
                    </p>
                  </div>

                  <PrimarySwipeButton size='lg' asChild className='group has-[>svg]:px-6'>
                    <Link href='/#contact'>
                      {copy.contactCta}
                      <ArrowRightIcon className='size-5 rotate-310 transition-transform duration-200' />
                    </Link>
                  </PrimarySwipeButton>
                </CardContent>
              </Card>
            </MotionPreset>
          </div>

          {/* Right Section - FAQ Accordion */}
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.3} transition={{ duration: 0.7 }}>
            <Accordion type='single' collapsible className='space-y-5' defaultValue='item-0'>
              {faqItems.map((item, index) => (
                <MotionPreset
                  key={index}
                  fade
                  slide={{ direction: 'down', offset: 30 }}
                  delay={0.6 + index * 0.1}
                  transition={{ duration: 0.6 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className='bg-muted group rounded-md border-0 transition-shadow duration-300'
                  >
                    <AccordionPrimitive.Header className='flex'>
                      <AccordionPrimitive.Trigger
                        data-slot='accordion-trigger'
                        className='focus-visible:border-ring focus-visible:ring-ring/50 [&[data-state=open]>svg]:text-primary-foreground [&[data-state=open]>svg]:bg-primary flex flex-1 items-center justify-between gap-4 rounded-md px-5 py-4 text-left text-base font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180'
                      >
                        {item.question}
                        <ArrowDownIcon className='text-primary bg-primary/10 pointer-events-none size-7 shrink-0 rounded-md p-1.5 transition-all duration-200' />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className='text-muted-foreground px-5 pb-4 text-base leading-relaxed'>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </MotionPreset>
              ))}
            </Accordion>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default FAQ
