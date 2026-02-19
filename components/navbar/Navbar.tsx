import DarkMode from './DarkMode'
import LinksDropdown from './LinksDropdown'
import Logo from './Logo'

import { LuAlignJustify } from 'react-icons/lu'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const Navbar = () => {
  const features = [
    {
      title: 'SAGI-USA',
      description: 'For people living in the USA ',
      href: '/all-members',
    },
    {
      title: 'SAGICAM',
      description: 'Loved ones living in Cameroon',
      href: '/add-member',
    },
    {
      title: 'SAGI-EU',
      description: 'For our people living in Europe',
      href: '#',
    },
    {
      title: 'SAGI-NIGERIA',
      description: 'Loved ones living in Nigeria',
      href: '#',
    },
    {
      title: 'SAGI-IVORY COST',
      description: 'Loved ones living in Ivory Cost',
      href: '#',
    },
    {
      title: 'SAGI-BURKINA',
      description: 'Loved ones living in Burkina Faso',
      href: '#',
    },
  ]

  return (
    <nav className='py-4 border-b fixed w-full z-50 bg-background '>
      <div className='container '>
        <nav className='flex items-center justify-between '>
          <Logo />
          <NavigationMenu className='hidden lg:block'>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                  Communities
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='grid w-[600px] grid-cols-2 p-3 bg-primary/5'>
                    {features.map((feature, index) => (
                      <NavigationMenuLink
                        href={feature.href}
                        key={index}
                        className='rounded-md p-3 transition-colors hover:bg-primary'
                      >
                        <div
                          key={feature.title}
                          className='hover:bg-primary hover:text-white'
                        >
                          <p className='mb-1 font-semibold '>{feature.title}</p>
                          <p className='text-sm text-muted-accent'>
                            {feature.description}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href='#'
                  className={navigationMenuTriggerStyle()}
                >
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href='#'
                  className={navigationMenuTriggerStyle()}
                >
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href='#'
                  className={navigationMenuTriggerStyle()}
                >
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className='hidden items-center gap-4 lg:flex'>
            <DarkMode />
            <LinksDropdown />
          </div>
          <Sheet>
            <SheetTrigger asChild className='lg:hidden'>
              <Button variant='outline' size='icon'>
                <LuAlignJustify className='h-4 w-4' />
              </Button>
            </SheetTrigger>
            <SheetContent side='top' className='max-h-screen overflow-auto'>
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className='flex flex-col p-4'>
                <Accordion type='single' collapsible className='mt-4 mb-2'>
                  <AccordionItem value='solutions' className='border-none'>
                    <AccordionTrigger className='text-base hover:no-underline'>
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='grid md:grid-cols-2'>
                        {features.map((feature, index) => (
                          <a
                            href={feature.href}
                            key={index}
                            className='rounded-md p-3 transition-colors hover:bd-primary'
                          >
                            <div key={feature.title} className='bg-muted'>
                              <p className='mb-1 font-semibold text-foreground '>
                                {feature.title}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                {feature.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className='flex flex-col gap-6'>
                  <a href='#' className='font-medium'>
                    Templates
                  </a>
                  <a href='#' className='font-medium'>
                    Blog
                  </a>
                  <a href='#' className='font-medium'>
                    Pricing
                  </a>
                </div>
                <div className='mt-6 flex flex-col gap-4'>
                  <DarkMode />
                  <LinksDropdown />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </nav>
  )
}

export default Navbar
