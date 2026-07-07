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
import { submitMemberTransferRequestAction, submitOutgoingMemberTransferRequestAction } from '@/utils/actions'

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

const getMemberNameSearchValue = (member: MemberTransferMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.associationCode} ${member.associationName} ${member.memberStatus}`.toLowerCase()

const formatAssociationLabel = (associationCode: string, associationName?: string | null) =>
  associationName ? `${associationCode} - ${associationName}` : associationCode

type TransferMode = 'incoming' | 'outgoing'

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
    incoming: {
      action: submitMemberTransferRequestAction,
      associationHelp: 'Search for the member you want to bring into your delegate association.',
      memberAssociationLabel: 'Current association',
      noMatches: 'No members match your search.',
      receivingAssociationLabel: 'Receiving association',
      searchLabel: 'Search outside members',
      searchPlaceholder: 'Search name, matriculation, association code, association name, or status',
      selectLabel: 'Select member to transfer in',
      submitText: 'Send release request',
      title: 'Request a member transfer in'
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
      selectLabel: 'Select member to transfer out',
      submitText: 'Start transfer out',
      title: 'Start a member transfer out'
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
    incoming: {
      action: submitMemberTransferRequestAction,
      associationHelp: 'Recherchez le membre que vous voulez faire entrer dans votre association déléguée.',
      memberAssociationLabel: 'Association actuelle',
      noMatches: 'Aucun membre ne correspond à votre recherche.',
      receivingAssociationLabel: 'Association destinataire',
      searchLabel: 'Rechercher des membres externes',
      searchPlaceholder: "Rechercher par nom, matricule, code d'association, nom d'association ou statut",
      selectLabel: 'Sélectionner le membre à transférer vers votre association',
      submitText: 'Envoyer la demande de libération',
      title: 'Demander un transfert entrant'
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
      selectLabel: 'Sélectionner le membre à transférer',
      submitText: 'Démarrer le transfert sortant',
      title: 'Démarrer un transfert sortant'
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
  currentAssociationCode: string
  currentAssociationName: string
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
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) return members

    return members.filter(member => getMemberNameSearchValue(member).includes(normalizedSearch))
  }, [members, searchQuery])

  const displayedMembers = filteredMembers.slice(0, maxVisibleMembers)
  const hiddenMatchCount = filteredMembers.length - displayedMembers.length

  const selectedReceivingAssociation = receivingAssociationOptions.find(
    association => association.associationCode === targetAssociationCode
  )

  const displayReceivingAssociationCode =
    mode === 'outgoing'
      ? targetAssociationCode.trim().toUpperCase()
      : (receivingAssociationCode ?? currentAssociationCode)

  const displayReceivingAssociationName =
    mode === 'outgoing' ? selectedReceivingAssociation?.associationName : currentAssociationName

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)

    const selectedMemberStillMatches =
      selectedMember && getMemberNameSearchValue(selectedMember).includes(nextSearchQuery.trim().toLowerCase())

    if (!selectedMemberStillMatches) {
      setSelectedMemberId('')
    }
  }

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

          {mode === 'outgoing' ? (
            <div className='grid gap-1.5'>
              <Label htmlFor='member-transfer-receiving-association-code'>{copy.fields.receivingAssociationCode}</Label>
              <Select
                disabled={receivingAssociationOptions.length === 0}
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
                  {receivingAssociationOptions.map(association => (
                    <SelectItem key={association.associationCode} value={association.associationCode}>
                      {association.associationCode} - {association.associationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {receivingAssociationOptions.length === 0 ? (
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
                      onClick={() => setSelectedMemberId(member.id)}
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

          <SubmitButton text={modeCopy.submitText} className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default MemberTransferRequestForm
