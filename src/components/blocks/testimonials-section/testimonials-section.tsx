import { Marquee } from '@/components/ui/marquee'

import TestimonialCard from '@/components/blocks/testimonials-section/testimonials-card'

export type TestimonialItem = {
  name: string
  handle: string
  rating: number
  content: string
}

type TestimonialsComponentProps = {
  testimonials: TestimonialItem[]
}

const TestimonialsComponent = ({ testimonials }: TestimonialsComponentProps) => {
  return (
    <section id='testimonials' className='bg-muted space-y-12 py-8 sm:space-y-16 sm:py-16 lg:space-y-24 lg:py-24'>
      <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
        <h2 className='text-2xl font-semibold md:text-4xl lg:text-6xl'>Trusted by families and delegates</h2>

        <p className='text-muted-foreground text-lg md:text-xl'>
          A practical support system built around clear rules, organized records, and community care.
        </p>
      </div>

      <div className='relative'>
        <div className='from-muted pointer-events-none absolute inset-y-0 left-0 z-1 w-35 bg-linear-to-r to-transparent max-sm:hidden' />
        <div className='from-muted pointer-events-none absolute inset-y-0 right-0 z-1 w-35 bg-linear-to-l to-transparent max-sm:hidden' />

        <div className='w-full overflow-hidden'>
          <Marquee pauseOnHover duration={30} gap={2} className='pb-4'>
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>

        <div className='w-full overflow-hidden'>
          <Marquee pauseOnHover duration={30} gap={2} reverse className='pt-4'>
            {testimonials.slice(3, 6).map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsComponent
