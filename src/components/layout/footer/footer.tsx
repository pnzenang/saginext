import { InstagramIcon, MailIcon, TwitchIcon, YoutubeIcon } from 'lucide-react'

import Link from 'next/link'

import HoverText from '@/components/layout/footer/hover-text'
import Logo from '@/components/logo'

const Footer = () => {
  return (
    <footer className='relative overflow-hidden'>
      <div className='pb mt-10 sm:px-16 md:-mb-2 lg:px-24'>
        <HoverText text='SAGI' />
      </div>
    </footer>
  )
}

export default Footer
