import { InstagramIcon, MailIcon, TwitchIcon, YoutubeIcon } from 'lucide-react'

import Link from 'next/link'

import HoverText from '@/components/layout/footer/hover-text'
import Logo from '@/components/logo'

const Footer = () => {
  return (
    <footer className='relative overflow-hidden'>
      <div className='mt-10 pb-10 sm:px-16 md:-mb-22 lg:px-24'>
        <HoverText text='SAGI' />
        <div className='mt-10 flex flex-col items-center justify-between gap-6 sm:flex-row'>
          {' '}
          <h1 className='text-center'> a 501(c)(3) organization</h1>
        </div>
        <Logo />
      </div>
    </footer>
  )
}

export default Footer
