import { AlertTriangle, Building2, CheckCircle2, Clock3, Inbox, MessageSquareText, ShieldCheck } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  createAdminIssueNoteAction,
  createDelegateIssueNoteAction,
  markIssueNoteReadAction,
  replyToIssueNoteAction,
  resolveIssueNoteAction
} from '@/utils/actions'
import type { fetchAdminIssueNotesPageAction } from '@/utils/actions'
import {
  delegateIssueNotePriorityLabels,
  delegateIssueNoteStatusLabels,
  type DelegateIssueNotePriority,
  type DelegateIssueNoteRole,
  type DelegateIssueNoteStatus
} from '@/utils/types'

type AdminIssueNotesData = Awaited<ReturnType<typeof fetchAdminIssueNotesPageAction>>
type IssueNote = AdminIssueNotesData['notes'][number]
type AssociationOption = AdminIssueNotesData['associations'][number]

const noteDateTimeFormatters: Record<AppLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const issueNotesCopy = {
  en: {
    adminCreateDescription: 'Send a note to a delegate association and keep the conversation in one thread.',
    adminCreateTitle: 'Send note to delegate',
    adminDescription: 'Track issues raised by delegates and messages sent by admin.',
    adminEmptyDescription: 'Delegate issues and admin notes will appear here.',
    adminEmptyTitle: 'No notes found.',
    adminTitle: 'Admin Notes',
    allNotes: 'All notes',
    association: 'Association',
    body: 'Message',
    clearBadge: 'Unread',
    createDescription: 'Raise an issue for admin review or ask a question about payments, members, or documents.',
    createTitle: 'Create note',
    delegateDescription: 'Communicate with SAGI admin about payment, member, and documentation issues.',
    delegateEmptyDescription: 'Messages from admin and issues you raise will appear here.',
    delegateEmptyTitle: 'No notes yet.',
    delegateTitle: 'Notes',
    lastUpdated: 'Last updated',
    markRead: 'Mark read',
    messages: 'Messages',
    noAssociations: 'No delegate associations are available.',
    openNotes: (count: number) => `${count} open`,
    priority: 'Priority',
    reply: 'Reply',
    replyPlaceholder: 'Write a reply',
    resolve: 'Resolve',
    send: 'Send',
    subject: 'Subject',
    unreadAlert: (count: number) => `${count} unread note${count === 1 ? '' : 's'} need attention.`,
    unreadBadge: (count: number) => `${count} unread`
  },
  fr: {
    adminCreateDescription: 'Envoyez une note à une association déléguée et gardez la conversation dans un fil.',
    adminCreateTitle: 'Envoyer une note au délégué',
    adminDescription: "Suivez les problèmes signalés par les délégués et les messages envoyés par l'admin.",
    adminEmptyDescription: "Les problèmes des délégués et les notes admin s'afficheront ici.",
    adminEmptyTitle: 'Aucune note trouvée.',
    adminTitle: 'Notes admin',
    allNotes: 'Toutes les notes',
    association: 'Association',
    body: 'Message',
    clearBadge: 'Non lu',
    createDescription:
      "Signalez un problème à l'admin ou posez une question sur les paiements, les membres ou les documents.",
    createTitle: 'Créer une note',
    delegateDescription: "Communiquez avec l'admin SAGI au sujet des paiements, des membres et des documents.",
    delegateEmptyDescription: "Les messages de l'admin et les problèmes que vous signalez s'afficheront ici.",
    delegateEmptyTitle: 'Aucune note pour le moment.',
    delegateTitle: 'Notes',
    lastUpdated: 'Dernière mise à jour',
    markRead: 'Marquer comme lu',
    messages: 'Messages',
    noAssociations: 'Aucune association déléguée disponible.',
    openNotes: (count: number) => `${count} ouverte${count === 1 ? '' : 's'}`,
    priority: 'Priorité',
    reply: 'Répondre',
    replyPlaceholder: 'Écrire une réponse',
    resolve: 'Résoudre',
    send: 'Envoyer',
    subject: 'Sujet',
    unreadAlert: (count: number) =>
      `${count} note${count === 1 ? '' : 's'} non lue${count === 1 ? '' : 's'} à traiter.`,
    unreadBadge: (count: number) => `${count} non lue${count === 1 ? '' : 's'}`
  }
} as const

const roleLabels: Record<AppLanguage, Record<DelegateIssueNoteRole, string>> = {
  en: {
    admin: 'Admin',
    delegate: 'Delegate'
  },
  fr: {
    admin: 'Admin',
    delegate: 'Délégué'
  }
}

const statusLabels: Record<AppLanguage, Record<DelegateIssueNoteStatus, string>> = {
  en: delegateIssueNoteStatusLabels,
  fr: {
    open: 'Ouverte',
    resolved: 'Résolue'
  }
}

const priorityLabels: Record<AppLanguage, Record<DelegateIssueNotePriority, string>> = {
  en: delegateIssueNotePriorityLabels,
  fr: {
    normal: 'Normale',
    urgent: 'Urgente'
  }
}

const getAssociationLabel = (associationCode: string, associationName?: string | null) =>
  associationName ? `${associationCode} - ${associationName}` : associationCode

const getNoteStatusLabel = (status: string, language: AppLanguage) =>
  statusLabels[language][status as DelegateIssueNoteStatus] ?? status

const getNotePriorityLabel = (priority: string, language: AppLanguage) =>
  priorityLabels[language][priority as DelegateIssueNotePriority] ?? priority

const formatNoteDateTime = (date: Date, language: AppLanguage) => noteDateTimeFormatters[language].format(date)

const getStatusBadgeClassName = (status: string) =>
  status === 'resolved'
    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
    : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'

const CreateIssueNoteForm = ({
  associations,
  isAdminUser,
  language
}: {
  associations: AssociationOption[]
  isAdminUser: boolean
  language: AppLanguage
}) => {
  const copy = issueNotesCopy[language]
  const hasAssociations = associations.length > 0
  const formAction = isAdminUser ? createAdminIssueNoteAction : createDelegateIssueNoteAction

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='gap-1 px-4 py-4 sm:px-5'>
        <CardTitle className='flex items-center gap-2 text-base font-extrabold'>
          {isAdminUser ? (
            <ShieldCheck className='text-primary size-4' />
          ) : (
            <MessageSquareText className='text-primary size-4' />
          )}
          {isAdminUser ? copy.adminCreateTitle : copy.createTitle}
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          {isAdminUser ? copy.adminCreateDescription : copy.createDescription}
        </p>
      </CardHeader>
      <CardContent className='px-4 pb-4 sm:px-5'>
        <FormContainer action={formAction} className='grid gap-3'>
          {isAdminUser ? (
            <div className='grid gap-1.5'>
              <Label htmlFor='associationCode'>{copy.association}</Label>
              <select
                id='associationCode'
                name='associationCode'
                required
                disabled={!hasAssociations}
                className='border-input bg-background ring-offset-background focus-visible:ring-ring min-h-10 w-full rounded-md border px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {hasAssociations ? (
                  associations.map(association => (
                    <option key={association.associationCode} value={association.associationCode}>
                      {getAssociationLabel(association.associationCode, association.associationName)}
                    </option>
                  ))
                ) : (
                  <option value=''>{copy.noAssociations}</option>
                )}
              </select>
            </div>
          ) : null}

          <div className='grid gap-1.5'>
            <Label htmlFor='subject'>{copy.subject}</Label>
            <Input id='subject' name='subject' maxLength={140} required className='bg-background' />
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='priority'>{copy.priority}</Label>
            <select
              id='priority'
              name='priority'
              defaultValue='normal'
              className='border-input bg-background ring-offset-background focus-visible:ring-ring min-h-10 w-full rounded-md border px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
            >
              <option value='normal'>{priorityLabels[language].normal}</option>
              <option value='urgent'>{priorityLabels[language].urgent}</option>
            </select>
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='body'>{copy.body}</Label>
            <Textarea id='body' name='body' maxLength={4000} required className='bg-background min-h-28' />
          </div>

          <SubmitButton text={copy.send} disabled={isAdminUser && !hasAssociations} className='h-10 w-full sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

const IssueNoteCard = ({
  isAdminUser,
  language,
  note
}: {
  isAdminUser: boolean
  language: AppLanguage
  note: IssueNote
}) => {
  const copy = issueNotesCopy[language]
  const isUnread = isAdminUser ? note.adminUnread : note.delegateUnread
  const isOpen = note.status === 'open'

  return (
    <Card
      className={cn(
        'rounded-lg py-0',
        isUnread ? 'border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20' : ''
      )}
    >
      <CardContent className='grid gap-4 px-4 py-4 sm:px-5'>
        <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='min-w-0 text-lg font-extrabold break-words'>{note.subject}</h3>
              {isUnread ? (
                <Badge
                  variant='outline'
                  className='border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                >
                  <AlertTriangle />
                  {copy.clearBadge}
                </Badge>
              ) : null}
            </div>
            <div className='text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold'>
              <span className='inline-flex items-center gap-1'>
                <Building2 className='size-3.5' />
                {getAssociationLabel(note.associationCode, note.associationName)}
              </span>
              <span className='inline-flex items-center gap-1'>
                <Clock3 className='size-3.5' />
                {copy.lastUpdated}: {formatNoteDateTime(note.lastMessageAt, language)}
              </span>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 sm:justify-end'>
            <Badge variant='outline' className={cn('capitalize', getStatusBadgeClassName(note.status))}>
              {note.status === 'resolved' ? <CheckCircle2 /> : <Clock3 />}
              {getNoteStatusLabel(note.status, language)}
            </Badge>
            <Badge
              variant='outline'
              className={cn(
                'capitalize',
                note.priority === 'urgent'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                  : ''
              )}
            >
              {getNotePriorityLabel(note.priority, language)}
            </Badge>
          </div>
        </div>

        <div className='grid gap-2'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <MessageSquareText className='text-primary size-4' />
            {copy.messages}
          </div>
          <div className='grid gap-2'>
            {note.messages.map(message => (
              <div key={message.id} className='bg-background grid gap-1 rounded-md border px-3 py-2'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <Badge variant='outline' className='capitalize'>
                    {roleLabels[language][message.authorRole as DelegateIssueNoteRole] ?? message.authorRole}
                  </Badge>
                  <span className='text-muted-foreground text-xs font-semibold'>
                    {formatNoteDateTime(message.createdAt, language)}
                  </span>
                </div>
                <p className='text-sm leading-6 whitespace-pre-wrap'>{message.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
          {isUnread ? (
            <FormContainer action={markIssueNoteReadAction} className='w-full sm:w-fit'>
              <input type='hidden' name='noteId' value={note.id} />
              <SubmitButton text={copy.markRead} className='h-9 w-full px-3 text-xs normal-case sm:w-fit' />
            </FormContainer>
          ) : null}

          {isAdminUser && isOpen ? (
            <FormContainer action={resolveIssueNoteAction} className='w-full sm:w-fit'>
              <input type='hidden' name='noteId' value={note.id} />
              <SubmitButton
                text={copy.resolve}
                className='h-9 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800 sm:w-fit'
              />
            </FormContainer>
          ) : null}
        </div>

        {isOpen ? (
          <FormContainer action={replyToIssueNoteAction} className='grid gap-2'>
            <input type='hidden' name='noteId' value={note.id} />
            <Label htmlFor={`reply-${note.id}`}>{copy.reply}</Label>
            <Textarea
              id={`reply-${note.id}`}
              name='body'
              maxLength={4000}
              required
              placeholder={copy.replyPlaceholder}
              className='bg-background min-h-20'
            />
            <SubmitButton text={copy.send} className='h-9 w-full px-3 text-xs normal-case sm:w-fit' />
          </FormContainer>
        ) : null}
      </CardContent>
    </Card>
  )
}

const IssueNotesPageContent = ({
  associations = [],
  isAdminUser,
  language,
  notes
}: {
  associations?: AssociationOption[]
  isAdminUser: boolean
  language: AppLanguage
  notes: IssueNote[]
}) => {
  const copy = issueNotesCopy[language]

  const unreadCount = notes.filter(
    note => note.status === 'open' && (isAdminUser ? note.adminUnread : note.delegateUnread)
  ).length

  const openCount = notes.filter(note => note.status === 'open').length

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>
            {isAdminUser ? copy.adminTitle : copy.delegateTitle}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {isAdminUser ? copy.adminDescription : copy.delegateDescription}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline' className='w-fit text-sm'>
            {copy.openNotes(openCount)}
          </Badge>
          {unreadCount > 0 ? (
            <Badge
              variant='outline'
              className='w-fit border-amber-300 bg-amber-50 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
            >
              {copy.unreadBadge(unreadCount)}
            </Badge>
          ) : null}
        </div>
      </div>

      {unreadCount > 0 ? (
        <Card className='rounded-lg border-amber-200 bg-amber-50 py-0 dark:border-amber-900 dark:bg-amber-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300' />
              <p className='font-extrabold text-amber-800 dark:text-amber-200'>{copy.unreadAlert(unreadCount)}</p>
            </div>
            <Badge
              variant='outline'
              className='w-fit border-amber-300 bg-white text-amber-800 dark:bg-black/20 dark:text-amber-200'
            >
              {copy.unreadBadge(unreadCount)}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <CreateIssueNoteForm associations={associations} isAdminUser={isAdminUser} language={language} />

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <Inbox className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>{copy.allNotes}</h2>
        </div>

        {notes.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <Inbox className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>{isAdminUser ? copy.adminEmptyTitle : copy.delegateEmptyTitle}</p>
              <p className='text-muted-foreground mt-1 text-sm'>
                {isAdminUser ? copy.adminEmptyDescription : copy.delegateEmptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 xl:grid-cols-2'>
            {notes.map(note => (
              <IssueNoteCard key={note.id} isAdminUser={isAdminUser} language={language} note={note} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default IssueNotesPageContent
