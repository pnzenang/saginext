import type { ReactNode } from 'react'

import { Inter, Lora, Roboto_Mono } from 'next/font/google'
import type { Metadata } from 'next'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
})

const lora = Lora({
  variable: '--font-serif',
  subsets: ['latin']
})

const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: {
    template: 'Demo: %s - Swipe | Shadcn Studio',
    default: 'Demo: Swipe - Mobile App Landing page | Shadcn Studio'
  },
  description:
    'Track expenses, manage budgets, and achieve your financial goals with Swipe - the app that puts you in control of your money.',
  robots: 'index,follow',
  keywords: ['expense tracking', 'budget management', 'financial goals', 'money management'],
  icons: {
    icon: [
      {
        url: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    other: [
      {
        url: '/favicon/android-chrome-192x192.png',
        rel: 'icon',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        rel: 'icon',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`),
  openGraph: {
    title: {
      template: 'Demo: %s - Swipe | Shadcn Studio',
      default: 'Demo: Swipe - Mobile App Landing page | Shadcn Studio'
    },
    description:
      'Track expenses, manage budgets, and achieve your financial goals with Swipe - the app that puts you in control of your money.',
    type: 'website',
    siteName: 'Swipe',
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`,
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: 'Swipe - Mobile App Landing page'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: 'Demo: %s - Swipe | Shadcn Studio',
      default: 'Demo: Swipe - Mobile App Landing page | Shadcn Studio'
    },
    description:
      'Track expenses, manage budgets, and achieve your financial goals with Swipe - the app that puts you in control of your money.'
  }
}

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html
      lang='en'
      className={cn(inter.variable, lora.variable, robotoMono.variable, 'flex min-h-full w-full scroll-smooth')}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col overflow-x-hidden'>
        <ThemeProvider attribute='class' enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <main>{children}</main>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
