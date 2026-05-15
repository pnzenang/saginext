import { InstagramIcon, MailIcon } from 'lucide-react'

import HoverText from '@/components/shadcn-studio/blocks/footer-component-09/hover-text'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-4'>
        <div className='text-muted-foreground flex justify-between gap-3 px-4 max-sm:flex-col sm:px-6 lg:px-8'>
          <div className='flex flex-col gap-7 max-sm:self-center'>
            <div className='flex items-center gap-4 max-sm:justify-center'></div>
            <span className='text-xs font-light'>
              © 2025 SAGI:, Active Solidarity Ltd-Helping People help each other.
            </span>
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-16'>
              <a href='#' className='hover:text-foreground transition-color duration-300'>
                Features
              </a>
              <a href='#' className='hover:text-foreground transition-color duration-300'>
                Testimonials
              </a>
            </div>
            <div className='flex items-center justify-between gap-16'>
              <a href='#' className='hover:text-foreground transition-color duration-300'>
                Benefits
              </a>
              <a href='#' className='hover:text-foreground transition-color duration-300'>
                Pricing
              </a>
            </div>
          </div>
        </div>

        <div className='pt-10 sm:px-16 lg:px-24'>
          <HoverText text='SAGI' />
        </div>
      </div>
    </footer>
  )
}

export default Footer
