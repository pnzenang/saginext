'use client'

import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

import { ChevronUpIcon, MessageCircleIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { normalizeLanguage, type AppLanguage } from '@/lib/i18n'
import { getSagiWhatsAppUrl, sagiWhatsAppContacts } from '@/utils/sagi-contact'

const floatingWhatsAppCopy = {
  en: {
    ariaLabel: 'Chat with SAGI on WhatsApp',
    label: 'Chat with SAGI',
    menuLabel: 'Choose a SAGI number',
    message: 'Hello SAGI, I need help.'
  },
  fr: {
    ariaLabel: 'Discuter avec SAGI sur WhatsApp',
    label: 'Discuter avec SAGI',
    menuLabel: 'Choisir un numéro SAGI',
    message: 'Bonjour SAGI, j’ai besoin d’aide.'
  }
} as const

const floatingWhatsAppClassName =
  'fixed right-4 bottom-5 z-[60] inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition hover:bg-[#1ebe5d] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6'

const FloatingWhatsAppLinkInner = ({ initialLanguage }: { initialLanguage: AppLanguage }) => {
  const searchParams = useSearchParams()
  const language = normalizeLanguage(searchParams.get('lang') ?? initialLanguage)
  const copy = floatingWhatsAppCopy[language]

  if (sagiWhatsAppContacts.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={copy.ariaLabel} className={floatingWhatsAppClassName}>
          <MessageCircleIcon className='size-5 shrink-0' aria-hidden='true' />
          <span>{copy.label}</span>
          <ChevronUpIcon className='size-4 shrink-0' aria-hidden='true' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' side='top' sideOffset={8} className='z-[70] w-64'>
          <DropdownMenuLabel>{copy.menuLabel}</DropdownMenuLabel>
          {sagiWhatsAppContacts.map(contact => (
            <DropdownMenuItem asChild className='cursor-pointer p-0' key={contact.id}>
              <a
                aria-label={`${copy.ariaLabel}: ${contact.display}`}
                className='flex w-full items-center gap-3 rounded-sm px-2 py-2'
                href={getSagiWhatsAppUrl(copy.message, contact.phone)}
                rel='noopener noreferrer'
                target='_blank'
              >
                <MessageCircleIcon className='size-4 shrink-0 text-[#25D366]' aria-hidden='true' />
                <span className='min-w-0'>
                  <span className='block font-medium'>{contact.label}</span>
                  <span className='text-muted-foreground block text-xs'>{contact.display}</span>
                </span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <a
      aria-label={copy.ariaLabel}
      className={floatingWhatsAppClassName}
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
