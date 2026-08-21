import { ArrowLeftRight, Inbox } from 'lucide-react'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import MemberTransferRequestList from '@/components/dashboard/MemberTransferRequestList'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchMemberTransferPageAction } from '@/utils/actions'

import MemberTransferRequestForm from './MemberTransferRequestForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const memberTransferPageCopy = {
  en: {
    alertBadge: (count: number) => `${count} required`,
    alertDescription: (count: number) => `${count} transfer request${count === 1 ? '' : 's'} need your approval.`,
    alertTitle: 'Transfer approval required',
    description:
      'Submit member transfer requests between delegate associations and review requests that need your approval.',
    emptyDescription: 'Submitted and incoming requests will appear here.',
    emptyTitle: 'No member transfer requests found.',
    noCurrentDescription: 'Members under your association code will appear here.',
    noCurrentTitle: 'No current members available to send.',
    noOutsideDescription: 'Members under other association codes will appear here.',
    noOutsideTitle: 'No outside members available to request.',
    requestsBadge: (count: number) => `${count} request${count === 1 ? '' : 's'}`,
    requestsTitle: 'Transfer requests',
    searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
    title: 'Member Transfer'
  },
  fr: {
    alertBadge: (count: number) => `${count} requise${count === 1 ? '' : 's'}`,
    alertDescription: (count: number) =>
      `${count} demande${count === 1 ? '' : 's'} de transfert nécessite${count === 1 ? '' : 'nt'} votre approbation.`,
    alertTitle: 'Approbation de transfert requise',
    description:
      'Soumettez des demandes de transfert de membres entre associations déléguées et révisez les demandes qui nécessitent votre approbation.',
    emptyDescription: 'Les demandes soumises et entrantes apparaîtront ici.',
    emptyTitle: 'Aucune demande de transfert trouvée.',
    noCurrentDescription: "Les membres sous votre code d'association apparaîtront ici.",
    noCurrentTitle: 'Aucun membre actuel disponible à envoyer.',
    noOutsideDescription: "Les membres sous d'autres codes d'association apparaîtront ici.",
    noOutsideTitle: 'Aucun membre externe disponible à demander.',
    requestsBadge: (count: number) => `${count} demande${count === 1 ? '' : 's'}`,
    requestsTitle: 'Demandes de transfert',
    searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
    title: 'Transfert de membre'
  }
} as const

const MemberTransferPage = async () => {
  const [language, transferPageData] = await Promise.all([getDashboardLanguage(), fetchMemberTransferPageAction()])

  const { currentMembers, members, nextCancelledTransferRefreshAt, profile, receivingAssociations, requests } =
    transferPageData

  const copy = memberTransferPageCopy[language]

  const delegateActionCount = requests.filter(
    request =>
      (request.initiatingClerkId === profile.clerkId &&
        ['admin_initiated', 'receiving_delegate_pending'].includes(request.status)) ||
      (request.receivingClerkId === profile.clerkId && request.status === 'initiating_delegate_approved')
  ).length

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <AutoRefreshAt refreshAt={nextCancelledTransferRefreshAt} />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>{copy.title}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{copy.description}</p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {copy.requestsBadge(requests.length)}
        </Badge>
      </div>

      {delegateActionCount > 0 ? (
        <Card className='rounded-lg border-blue-200 bg-blue-50 py-0 dark:border-blue-900 dark:bg-blue-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <Inbox className='mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-blue-800 dark:text-blue-200'>{copy.alertTitle}</p>
                <p className='text-sm text-blue-700 dark:text-blue-300'>{copy.alertDescription(delegateActionCount)}</p>
              </div>
            </div>
            <Badge
              variant='outline'
              className='w-fit border-blue-300 bg-white text-blue-800 dark:bg-black/20 dark:text-blue-200'
            >
              {copy.alertBadge(delegateActionCount)}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <div className='grid gap-4 xl:grid-cols-2'>
        {members.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>{copy.noOutsideTitle}</p>
              <p className='text-muted-foreground mt-1 text-sm'>{copy.noOutsideDescription}</p>
            </CardContent>
          </Card>
        ) : (
          <MemberTransferRequestForm
            currentAssociationCode={profile.associationCode}
            currentAssociationName={profile.associationName}
            language={language}
            members={members}
            mode='incoming'
            receivingAssociationCode={profile.associationCode}
          />
        )}

        {currentMembers.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>{copy.noCurrentTitle}</p>
              <p className='text-muted-foreground mt-1 text-sm'>{copy.noCurrentDescription}</p>
            </CardContent>
          </Card>
        ) : (
          <MemberTransferRequestForm
            currentAssociationCode={profile.associationCode}
            currentAssociationName={profile.associationName}
            language={language}
            members={currentMembers}
            mode='outgoing'
            receivingAssociationOptions={receivingAssociations}
          />
        )}
      </div>

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <ArrowLeftRight className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>{copy.requestsTitle}</h2>
        </div>
        <MemberTransferRequestList
          currentUserClerkId={profile.clerkId}
          emptyDescription={copy.emptyDescription}
          emptyIcon='inbox'
          emptyTitle={copy.emptyTitle}
          isAdminUser={false}
          language={language}
          requests={requests}
          searchPlaceholder={copy.searchPlaceholder}
          storageKey='sagi:member-transfer:request-search'
        />
      </div>
    </section>
  )
}

export default MemberTransferPage
