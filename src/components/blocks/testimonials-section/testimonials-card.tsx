import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Rating } from '@/components/ui/rating'

type Testimonial = {
  name: string
  handle: string

  rating: number
  content: string
  // platformName: string
  // platformIcon: string
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <Card className='w-96 shrink-0 shadow-none hover:shadow-md'>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex gap-1'>
            <Rating readOnly variant='yellow' size={22} value={testimonial.rating} precision={0.5} />
            <span className='sr-only'>{testimonial.rating} out of 5 stars</span>
          </div>

          <div className='flex items-center gap-1.5'></div>
        </div>

        <p>{testimonial.content}</p>

        <div className='flex items-center gap-3'>
          <Avatar className='size-10'>
            {/* <AvatarImage src={testimonial.avatar} alt={testimonial.name} /> */}
            <AvatarFallback className='text-sm'>
              {testimonial.name
                .split(' ', 2)
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-0.5'>
            <h3 className='font-medium'>{testimonial.name}</h3>
            <p className='text-muted-foreground'>{testimonial.handle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TestimonialCard
