'use client'

import { useMemo } from 'react'

import { ArrowLeftRight, Inbox, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { formatMemberTransferRequestStatus, type AppLanguage } from '@/lib/i18n'

import MemberTransferRequestCard, { type MemberTransferRequestCardData } from './MemberTransferRequestCard'

type EmptyIcon = 'inbox' | 'transfer'

const getRequestSearchValue = (request: MemberTransferRequestCardData, language: AppLanguage) =>
  [
    request.currentFirstName,
    request.currentLastAndMiddleNames,
    request.initiatingAssociationCode,
    request.initiatingAssociationName,
    request.member?.associationCode,
    request.member?.associationName,
    request.member?.firstName,
    request.member?.lastAndMiddleNames,
    request.member?.memberMatriculationNumber,
    request.memberMatriculationNumber,
    request.receivingAssociationCode,
    request.receivingAssociationName,
    request.rejectionReason,
    formatMemberTransferRequestStatus(request.status, language),
    request.status
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const EmptyStateIcon = ({ icon }: { icon: EmptyIcon }) => {
  const Icon = icon === 'inbox' ? Inbox : ArrowLeftRight

  return <Icon className='text-muted-foreground mx-auto mb-3 size-8' />
}

const memberTransferRequestListCopy = {
  en: {
    clear: 'Clear',
    noMatchesDescription: 'Try another name, matriculation number, association code, association name, or status.',
    noMatchesTitle: 'No transfer requests match your search.',
    searchLabel: 'Search transfer requests',
    showing: (filteredCount: number, totalCount: number) =>
      `Showing ${filteredCount} of ${totalCount} request${totalCount === 1 ? '' : 's'}.`
  },
  fr: {
    clear: 'Effacer',
    noMatchesDescription: "Essayez un autre nom, matricule, code d'association, nom d'association ou statut.",
    noMatchesTitle: 'Aucune demande de transfert ne correspond à votre recherche.',
    searchLabel: 'Rechercher des demandes de transfert',
    showing: (filteredCount: number, totalCount: number) =>
      `Affichage de ${filteredCount} sur ${totalCount} demande${totalCount === 1 ? '' : 's'}.`
  }
} as const

const MemberTransferRequestList = ({
  currentUserClerkId,
  emptyDescription,
  emptyIcon,
  emptyTitle,
  isAdminUser,
  language,
  requests,
  searchPlaceholder,
  storageKey
}: {
  currentUserClerkId?: string
  emptyDescription: string
  emptyIcon: EmptyIcon
  emptyTitle: string
  isAdminUser: boolean
  language: AppLanguage
  requests: MemberTransferRequestCardData[]
  searchPlaceholder: string
  storageKey: string
}) => {
  const copy = memberTransferRequestListCopy[language]
  const [search, setSearch] = usePersistentState(storageKey, '')
  const normalizedSearch = search.trim().toLowerCase()

  const filteredRequests = useMemo(() => {
    if (!normalizedSearch) return requests

    return requests.filter(request => getRequestSearchValue(request, language).includes(normalizedSearch))
  }, [language, normalizedSearch, requests])

  const searchInputId = `${storageKey.replace(/[^a-z0-9-]/gi, '-')}-search`

  return (
    <div className='grid gap-3'>
      {requests.length > 0 ? (
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
            <label htmlFor={searchInputId} className='sr-only'>
              {copy.searchLabel}
            </label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id={searchInputId}
                type='search'
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className='bg-background h-10 pl-9 text-sm font-semibold'
              />
            </div>
          </form>
          {normalizedSearch ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-10 w-full sm:w-fit'
              onClick={() => setSearch('')}
            >
              <X />
              {copy.clear}
            </Button>
          ) : null}
        </div>
      ) : null}

      {normalizedSearch ? (
        <p className='text-muted-foreground text-xs'>{copy.showing(filteredRequests.length, requests.length)}</p>
      ) : null}

      {requests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <EmptyStateIcon icon={emptyIcon} />
            <p className='font-semibold'>{emptyTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{emptyDescription}</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Search className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>{copy.noMatchesTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{copy.noMatchesDescription}</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
          {filteredRequests.map(request => (
            <MemberTransferRequestCard
              key={request.id}
              currentUserClerkId={currentUserClerkId}
              isAdminUser={isAdminUser}
              language={language}
              request={request}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MemberTransferRequestList
