import type { ReactNode } from 'react'

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { siteDescription, siteKeywords, siteName, siteTitle, siteUrl } from '@/lib/site'

import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s - SAGI',
    default: siteTitle
  },
  description: siteDescription,
  robots: 'index,follow',
  keywords: siteKeywords,
  alternates: {
    canonical: '/'
  },
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
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: {
      template: '%s - SAGI',
      default: siteTitle
    },
    description:
      'A mutual aid community where low monthly contributions create real funeral support for families when it matters most.',
    type: 'website',
    siteName,
    url: '/',
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: siteTitle
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s - SAGI',
      default: siteTitle
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
