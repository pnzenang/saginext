import AccordionWithImage from '@/components/shadcn-studio/blocks/features-section-02/accordion-with-image'

import { MotionPreset } from '@/components/ui/motion-preset'

const Features2 = () => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
          >
            <p className='text-2xl md:text-4xl lg:text-6xl'>Internal Rules At Glance</p>
          </MotionPreset>
          <MotionPreset
            component='p'
            className='text-muted-foreground text-xl'
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.5 }}
          >
            Here, you can find a summary of our internal rules and guidelines.
          </MotionPreset>
        </div>
        <AccordionWithImage />
      </div>
    </section>
  )
}

export default Features2
