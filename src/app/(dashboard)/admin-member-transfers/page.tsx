import { ArrowLeftRight, ShieldCheck } from 'lucide-react'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import MemberTransferRequestList from '@/components/dashboard/MemberTransferRequestList'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchAdminMemberTransferPageAction } from '@/utils/actions'

import MemberTransferRequestForm from '../member-transfer/MemberTransferRequestForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const adminMemberTransfersPageCopy = {
  en: {
    delegatePendingBadge: (count: number) => `${count} pending`,
    delegatePendingDescription: (count: number) =>
      `${count} open transfer request${count === 1 ? '' : 's'} still need${count === 1 ? 's' : ''} delegate approval before admin can complete it.`,
    delegatePendingTitle: 'Delegate approval pending',
    description: 'Initiate member transfer requests and complete them after both delegate associations approve.',
    emptyDescription: 'Open transfer requests will appear here.',
    emptyTitle: 'No member transfer requests found.',
    listTitle: 'All member transfer requests',
    pendingBadge: (count: number) => `${count} pending`,
    pendingDescription: (count: number) =>
      `${count} request${count === 1 ? '' : 's'} approved by both delegates and waiting for admin approval.`,
    pendingTitle: 'Two-delegate approval complete',
    requestsBadge: (count: number) => `${count} request${count === 1 ? '' : 's'}`,
    searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
    title: 'Admin Member Transfers'
  },
  fr: {
    delegatePendingBadge: (count: number) => `${count} en attente`,
    delegatePendingDescription: (count: number) =>
      `${count} demande${count === 1 ? '' : 's'} de transfert ouverte${count === 1 ? '' : 's'} nécessite${count === 1 ? '' : 'nt'} encore l'approbation des délégués avant que l'admin puisse la terminer.`,
    delegatePendingTitle: 'Approbation des délégués en attente',
    description: 'Initiez les demandes de transfert et terminez-les après approbation des deux associations déléguées.',
    emptyDescription: 'Les demandes de transfert ouvertes apparaîtront ici.',
    emptyTitle: 'Aucune demande de transfert trouvée.',
    listTitle: 'Toutes les demandes de transfert',
    pendingBadge: (count: number) => `${count} en attente`,
    pendingDescription: (count: number) =>
      `${count} demande${count === 1 ? '' : 's'} approuvée${count === 1 ? '' : 's'} par les deux délégués en attente de l'approbation admin.`,
    pendingTitle: 'Approbation des deux délégués terminée',
    requestsBadge: (count: number) => `${count} demande${count === 1 ? '' : 's'}`,
    searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
    title: 'Transferts de membres admin'
  }
} as const

const AdminMemberTransfersPage = async () => {
  const [language, adminTransferData] = await Promise.all([
    getDashboardLanguage(),
    fetchAdminMemberTransferPageAction()
  ])

  const { members, nextCancelledTransferRefreshAt, receivingAssociations, requests } = adminTransferData

  const copy = adminMemberTransfersPageCopy[language]

  const pendingAdminCount = requests.filter(request => request.status === 'receiving_delegate_approved').length

  const delegatePendingCount = requests.filter(request =>
    ['admin_initiated', 'receiving_delegate_pending', 'initiating_delegate_approved'].includes(request.status)
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

      {pendingAdminCount > 0 ? (
        <Card className='rounded-lg border-amber-200 bg-amber-50 py-0 dark:border-amber-900 dark:bg-amber-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <ShieldCheck className='mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-amber-800 dark:text-amber-200'>{copy.pendingTitle}</p>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  {copy.pendingDescription(pendingAdminCount)}
                </p>
              </div>
            </div>
            <Badge
              variant='outline'
              className='w-fit border-amber-300 bg-white text-amber-800 dark:bg-black/20 dark:text-amber-200'
            >
              {copy.pendingBadge(pendingAdminCount)}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {delegatePendingCount > 0 ? (
        <Card className='rounded-lg border-blue-200 bg-blue-50 py-0 dark:border-blue-900 dark:bg-blue-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <ArrowLeftRight className='mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-blue-800 dark:text-blue-200'>{copy.delegatePendingTitle}</p>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {copy.delegatePendingDescription(delegatePendingCount)}
                </p>
              </div>
            </div>
            <Badge
              variant='outline'
              className='w-fit border-blue-300 bg-white text-blue-800 dark:bg-black/20 dark:text-blue-200'
            >
              {copy.delegatePendingBadge(delegatePendingCount)}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <MemberTransferRequestForm
        language={language}
        members={members}
        mode='admin'
        receivingAssociationOptions={receivingAssociations}
      />

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <ArrowLeftRight className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>{copy.listTitle}</h2>
        </div>
        <MemberTransferRequestList
          emptyDescription={copy.emptyDescription}
          emptyIcon='transfer'
          emptyTitle={copy.emptyTitle}
          isAdminUser
          language={language}
          requests={requests}
          searchPlaceholder={copy.searchPlaceholder}
          storageKey='sagi:admin-member-transfers:request-search'
        />
      </div>
    </section>
  )
}

export default AdminMemberTransfersPage
