import type { ReactNode } from 'react'

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s - SAGI',
    default: 'SAGI: Active Solidarity Ltd.'
  },
  description:
    'SAGI is a mutual aid community helping members and families prepare for funeral expenses through shared contributions and organized support.',
  robots: 'index,follow',
  keywords: ['SAGI', 'mutual aid', 'funeral support', 'member contributions', 'family support'],
  icons: {
    icon: [
      {
        url: '/favicon/sagi-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
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
      template: '%s - SAGI',
      default: 'SAGI: Active Solidarity Ltd.'
    },
    description:
      'A mutual aid community where low monthly contributions create real funeral support for families when it matters most.',
    type: 'website',
    siteName: 'SAGI',
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`,
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: 'SAGI: Active Solidarity Ltd.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s - SAGI',
      default: 'SAGI: Active Solidarity Ltd.'
    },
    description:
      'SAGI helps members and families prepare for funeral expenses through shared contributions and organized support.'
  }
}

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang='en' className='flex min-h-full w-full scroll-smooth' suppressHydrationWarning>
      <body className='flex min-h-full w-full flex-auto flex-col overflow-x-hidden'>
        <ClerkProvider>
          <ThemeProvider attribute='class' enableSystem={false} disableTransitionOnChange>
            <TooltipProvider>
              <main>{children}</main>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

export default RootLayout
