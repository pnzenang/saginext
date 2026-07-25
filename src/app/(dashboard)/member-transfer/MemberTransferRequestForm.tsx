'use client'

import { useMemo, useState } from 'react'

import { ArrowLeftRight, Search } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatMemberStatus, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  submitAdminMemberTransferRequestAction,
  submitMemberTransferRequestAction,
  submitOutgoingMemberTransferRequestAction
} from '@/utils/actions'

type MemberTransferMemberOption = {
  associationCode: string
  associationName: string
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  memberStatus: string
}

type MemberTransferAssociationOption = {
  associationCode: string
  associationName: string
}

const maxVisibleMembers = 10

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

const getSearchTokens = (value: string) => normalizeSearchText(value).split(' ').filter(Boolean)

const getMemberSearchValue = (member: MemberTransferMemberOption) =>
  normalizeSearchText(
    `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.associationCode} ${member.associationName} ${member.memberStatus}`
  )

const memberMatchesSearch = (member: MemberTransferMemberOption, searchTokens: string[]) => {
  if (searchTokens.length === 0) return true

  const searchableMemberValue = getMemberSearchValue(member)

  return searchTokens.every(token => searchableMemberValue.includes(token))
}

const formatAssociationLabel = (associationCode: string, associationName?: string | null) =>
  associationName ? `${associationCode} - ${associationName}` : associationCode

type TransferMode = 'admin' | 'incoming' | 'outgoing'

const transferFormCopy = {
  en: {
    fields: {
      currentAssociationInline: 'Current association',
      memberStatus: 'Member status',
      matriculation: 'Matriculation',
      notApplicable: 'N/A',
      receivingAssociationCode: 'Receiving association code',
      selectAssociation: 'Select association',
      selectedMember: 'Selected member'
    },
    admin: {
      action: submitAdminMemberTransferRequestAction,
      associationHelp:
        'Select any member and choose the association receiving the member. Delegates will approve the request before admin completion.',
      memberAssociationLabel: 'Current association',
      noMatches: 'No members match your search.',
      receivingAssociationLabel: 'Receiving association',
      searchLabel: 'Search all members',
      searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
      selectLabel: 'Select member to transfer',
      submitText: 'Initiate transfer',
      title: 'Initiate transfer as admin'
    },
    incoming: {
      action: submitMemberTransferRequestAction,
      associationHelp: 'Search for the member you want to bring into your delegate association.',
      memberAssociationLabel: 'Current association',
      noMatches: 'No members match your search.',
      receivingAssociationLabel: 'Receiving association',
      searchLabel: 'Search outside members',
      searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
      selectLabel: 'Select member to request',
      submitText: 'Send release request',
      title: 'Request a member from another association'
    },
    matches: (count: number) => `${count} match${count === 1 ? '' : 'es'}`,
    noOtherAssociations: 'No other delegate associations are available.',
    outgoing: {
      action: submitOutgoingMemberTransferRequestAction,
      associationHelp: 'Select one of your current members and choose the association receiving the member.',
      memberAssociationLabel: 'Current association',
      noMatches: 'No current members match your search.',
      receivingAssociationLabel: 'Receiving association',
      searchLabel: 'Search your members',
      searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
      selectLabel: 'Select member to send',
      submitText: 'Send transfer request',
      title: 'Send a member to another association'
    },
    selectMember: 'Select a member',
    selectReceivingAssociation: 'Select receiving association',
    showingFirstMatches: (count: number) => `Showing first ${count} matches. Keep typing to narrow the search.`
  },
  fr: {
    fields: {
      currentAssociationInline: 'Association actuelle',
      memberStatus: 'Statut du membre',
      matriculation: 'Matricule',
      notApplicable: 'S/O',
      receivingAssociationCode: "Code de l'association destinataire",
      selectAssociation: 'Sélectionner une association',
      selectedMember: 'Membre sélectionné'
    },
    admin: {
      action: submitAdminMemberTransferRequestAction,
      associationHelp:
        "Sélectionnez un membre et choisissez l'association destinataire. Les délégués approuveront la demande avant la finalisation admin.",
      memberAssociationLabel: 'Association actuelle',
      noMatches: 'Aucun membre ne correspond à votre recherche.',
      receivingAssociationLabel: 'Association destinataire',
      searchLabel: 'Rechercher tous les membres',
      searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
      selectLabel: 'Sélectionner le membre à transférer',
      submitText: 'Initier le transfert',
      title: 'Initier un transfert comme admin'
    },
    incoming: {
      action: submitMemberTransferRequestAction,
      associationHelp: 'Recherchez le membre que vous voulez faire entrer dans votre association déléguée.',
      memberAssociationLabel: 'Association actuelle',
      noMatches: 'Aucun membre ne correspond à votre recherche.',
      receivingAssociationLabel: 'Association destinataire',
      searchLabel: 'Rechercher des membres externes',
      searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
      selectLabel: 'Sélectionner le membre à demander',
      submitText: 'Envoyer la demande de libération',
      title: 'Demander un membre à une autre association'
    },
    matches: (count: number) => `${count} résultat${count === 1 ? '' : 's'}`,
    noOtherAssociations: 'Aucune autre association déléguée n’est disponible.',
    outgoing: {
      action: submitOutgoingMemberTransferRequestAction,
      associationHelp: 'Sélectionnez l’un de vos membres actuels et choisissez l’association qui le recevra.',
      memberAssociationLabel: 'Association actuelle',
      noMatches: 'Aucun membre actuel ne correspond à votre recherche.',
      receivingAssociationLabel: 'Association destinataire',
      searchLabel: 'Rechercher vos membres',
      searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
      selectLabel: 'Sélectionner le membre à envoyer',
      submitText: 'Envoyer la demande de transfert',
      title: 'Envoyer un membre à une autre association'
    },
    selectMember: 'Sélectionner un membre',
    selectReceivingAssociation: 'Sélectionner l’association destinataire',
    showingFirstMatches: (count: number) =>
      `Affichage des ${count} premiers résultats. Continuez à écrire pour affiner la recherche.`
  }
} as const

const MemberTransferRequestForm = ({
  currentAssociationCode,
  currentAssociationName,
  language,
  mode,
  members,
  receivingAssociationOptions = [],
  receivingAssociationCode
}: {
  currentAssociationCode?: string
  currentAssociationName?: string
  language: AppLanguage
  mode: TransferMode
  members: MemberTransferMemberOption[]
  receivingAssociationOptions?: MemberTransferAssociationOption[]
  receivingAssociationCode?: string
}) => {
  const copy = transferFormCopy[language]
  const modeCopy = copy[mode]
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [targetAssociationCode, setTargetAssociationCode] = useState(receivingAssociationCode ?? '')

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  const filteredMembers = useMemo(() => {
    const searchTokens = getSearchTokens(searchQuery)

    if (searchTokens.length === 0) return members

    return members.filter(member => memberMatchesSearch(member, searchTokens))
  }, [members, searchQuery])

  const displayedMembers = filteredMembers.slice(0, maxVisibleMembers)
  const hiddenMatchCount = filteredMembers.length - displayedMembers.length

  const availableReceivingAssociationOptions = useMemo(() => {
    if (mode !== 'admin' || !selectedMember) return receivingAssociationOptions

    const selectedMemberAssociationCode = selectedMember.associationCode.toUpperCase()

    return receivingAssociationOptions.filter(
      association => association.associationCode.toUpperCase() !== selectedMemberAssociationCode
    )
  }, [mode, receivingAssociationOptions, selectedMember])

  const selectedReceivingAssociation = availableReceivingAssociationOptions.find(
    association => association.associationCode === targetAssociationCode
  )

  const displayReceivingAssociationCode =
    mode === 'outgoing' || mode === 'admin'
      ? targetAssociationCode.trim().toUpperCase()
      : (receivingAssociationCode ?? currentAssociationCode ?? '')

  const displayReceivingAssociationName =
    mode === 'outgoing' || mode === 'admin' ? selectedReceivingAssociation?.associationName : currentAssociationName

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)

    const selectedMemberStillMatches =
      selectedMember && memberMatchesSearch(selectedMember, getSearchTokens(nextSearchQuery))

    if (!selectedMemberStillMatches) {
      setSelectedMemberId('')

      if (mode === 'admin') {
        setTargetAssociationCode('')
      }
    }
  }

  const handleMemberSelect = (member: MemberTransferMemberOption) => {
    setSelectedMemberId(member.id)

    if (mode === 'admin' && targetAssociationCode.toUpperCase() === member.associationCode.toUpperCase()) {
      setTargetAssociationCode('')
    }
  }

  const needsReceivingAssociationSelection = mode === 'outgoing' || mode === 'admin'

  const isReceivingAssociationSelectDisabled =
    (mode === 'admin' && !selectedMember) || availableReceivingAssociationOptions.length === 0

  const hasSelectedReceivingAssociation =
    !needsReceivingAssociationSelection ||
    availableReceivingAssociationOptions.some(association => association.associationCode === targetAssociationCode)

  const isSubmitDisabled = !selectedMemberId || !hasSelectedReceivingAssociation

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='border-b px-4 py-4'>
        <div className='flex items-start gap-3'>
          <ArrowLeftRight className='text-primary mt-1 size-5 shrink-0' />
          <div className='min-w-0'>
            <CardTitle className='text-lg break-words'>{modeCopy.title}</CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>{modeCopy.associationHelp}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4'>
        <FormContainer action={modeCopy.action} className='grid gap-3'>
          <input type='hidden' name='memberId' value={selectedMemberId} />
          <div className='grid gap-1.5'>
            <Label htmlFor={`member-transfer-${mode}-search`}>{modeCopy.searchLabel}</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id={`member-transfer-${mode}-search`}
                type='search'
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder={modeCopy.searchPlaceholder}
                className='pl-9'
              />
            </div>
          </div>

          {needsReceivingAssociationSelection ? (
            <div className='grid gap-1.5'>
              <Label htmlFor='member-transfer-receiving-association-code'>{copy.fields.receivingAssociationCode}</Label>
              <Select
                disabled={isReceivingAssociationSelectDisabled}
                name='receivingAssociationCode'
                onValueChange={setTargetAssociationCode}
                required
                value={targetAssociationCode}
              >
                <SelectTrigger
                  id='member-transfer-receiving-association-code'
                  className='bg-background w-full font-extrabold uppercase'
                >
                  <SelectValue placeholder={copy.selectReceivingAssociation} />
                </SelectTrigger>
                <SelectContent>
                  {availableReceivingAssociationOptions.map(association => (
                    <SelectItem key={association.associationCode} value={association.associationCode}>
                      {association.associationCode} - {association.associationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableReceivingAssociationOptions.length === 0 ? (
                <p className='text-muted-foreground text-xs'>{copy.noOtherAssociations}</p>
              ) : null}
            </div>
          ) : null}

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-semibold'>{modeCopy.selectLabel}</p>
              <p className='text-muted-foreground text-xs'>{copy.matches(filteredMembers.length)}</p>
            </div>
            {filteredMembers.length === 0 ? (
              <p className='text-muted-foreground bg-muted/30 rounded-md border p-3 text-sm'>{modeCopy.noMatches}</p>
            ) : (
              <div className='grid max-h-72 gap-2 overflow-y-auto pr-1'>
                {displayedMembers.map(member => {
                  const isSelected = selectedMemberId === member.id

                  return (
                    <button
                      key={member.id}
                      type='button'
                      aria-pressed={isSelected}
                      onClick={() => handleMemberSelect(member)}
                      className={cn(
                        'bg-background/70 hover:border-primary/60 hover:bg-muted/40 grid min-w-0 gap-1 rounded-md border p-3 text-left text-sm transition-colors',
                        isSelected && 'border-primary bg-primary/10'
                      )}
                    >
                      <span className='font-extrabold break-words'>
                        {member.firstName} {member.lastAndMiddleNames}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {copy.fields.matriculation}: {member.memberMatriculationNumber} ·{' '}
                        {copy.fields.currentAssociationInline}:{' '}
                        {formatAssociationLabel(member.associationCode, member.associationName)}
                      </span>
                      <span className='text-primary text-xs font-semibold'>
                        {copy.fields.memberStatus}: {formatMemberStatus(member.memberStatus, language)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            {hiddenMatchCount > 0 ? (
              <p className='text-muted-foreground text-xs'>{copy.showingFirstMatches(maxVisibleMembers)}</p>
            ) : null}
          </div>

          <div className='bg-muted/30 grid gap-2 rounded-md border p-3 sm:grid-cols-2'>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{copy.fields.selectedMember}</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember
                  ? `${selectedMember.firstName} ${selectedMember.lastAndMiddleNames}`
                  : copy.selectMember}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{modeCopy.memberAssociationLabel}</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember
                  ? formatAssociationLabel(selectedMember.associationCode, selectedMember.associationName)
                  : copy.fields.notApplicable}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{modeCopy.receivingAssociationLabel}</p>
              <p className='mt-1 font-extrabold break-words'>
                {displayReceivingAssociationCode
                  ? formatAssociationLabel(displayReceivingAssociationCode, displayReceivingAssociationName)
                  : copy.fields.selectAssociation}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{copy.fields.memberStatus}</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? formatMemberStatus(selectedMember.memberStatus, language) : copy.fields.notApplicable}
              </p>
            </div>
          </div>

          <SubmitButton
            disabled={isSubmitDisabled}
            text={modeCopy.submitText}
            className='h-9 w-full text-sm normal-case sm:w-fit'
          />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default MemberTransferRequestForm
