'use client'

import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

import { MessageCircleIcon } from 'lucide-react'

import { normalizeLanguage, type AppLanguage } from '@/lib/i18n'
import { getSagiWhatsAppUrl } from '@/utils/sagi-contact'

const floatingWhatsAppCopy = {
  en: {
    ariaLabel: 'Chat with SAGI on WhatsApp',
    label: 'Chat with SAGI',
    message: 'Hello SAGI, I need help.'
  },
  fr: {
    ariaLabel: 'Discuter avec SAGI sur WhatsApp',
    label: 'Discuter avec SAGI',
    message: "Bonjour SAGI, j’ai besoin d’aide."
  }
} as const

const FloatingWhatsAppLinkInner = ({ initialLanguage }: { initialLanguage: AppLanguage }) => {
  const searchParams = useSearchParams()
  const language = normalizeLanguage(searchParams.get('lang') ?? initialLanguage)
  const copy = floatingWhatsAppCopy[language]

  return (
    <a
      aria-label={copy.ariaLabel}
      className='fixed right-4 bottom-5 z-[60] inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition hover:bg-[#1ebe5d] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6'
      href={getSagiWhatsAppUrl(copy.message)}
      rel='noopener noreferrer'
      target='_blank'
    >
      <MessageCircleIcon className='size-5 shrink-0' aria-hidden='true' />
      <span>{copy.label}</span>
    </a>
  )
}

const FloatingWhatsAppLink = ({ initialLanguage = 'en' }: { initialLanguage?: AppLanguage }) => (
  <Suspense fallback={null}>
    <FloatingWhatsAppLinkInner initialLanguage={initialLanguage} />
  </Suspense>
)

export default FloatingWhatsAppLink
