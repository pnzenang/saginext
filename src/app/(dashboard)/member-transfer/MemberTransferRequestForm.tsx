'use client'

import { useMemo, useState } from 'react'

import { ArrowLeftRight, Search } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitMemberTransferRequestAction, submitOutgoingMemberTransferRequestAction } from '@/utils/actions'

type MemberTransferMemberOption = {
  associationCode: string
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  memberStatus: string
}

const maxVisibleMembers = 10

const getMemberNameSearchValue = (member: MemberTransferMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.associationCode} ${member.memberStatus}`.toLowerCase()

const formatMemberStatus = (status: string) =>
  status
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

type TransferMode = 'incoming' | 'outgoing'

const transferFormCopy = {
  incoming: {
    action: submitMemberTransferRequestAction,
    associationHelp: 'Search for the member you want to bring into your delegate association.',
    memberAssociationLabel: 'Current association code',
    noMatches: 'No members match your search.',
    receivingAssociationLabel: 'Receiving association code',
    searchLabel: 'Search outside members by name',
    searchPlaceholder: 'Search name, matriculation, association code, or status',
    selectLabel: 'Select member to transfer in',
    submitText: 'Send release request',
    title: 'Request a member transfer in'
  },
  outgoing: {
    action: submitOutgoingMemberTransferRequestAction,
    associationHelp: 'Select one of your current members and enter the association code receiving the member.',
    memberAssociationLabel: 'Current association code',
    noMatches: 'No current members match your search.',
    receivingAssociationLabel: 'Receiving association code',
    searchLabel: 'Search your members by name',
    searchPlaceholder: 'Search your members by name, matriculation, or status',
    selectLabel: 'Select member to transfer out',
    submitText: 'Start transfer out',
    title: 'Start a member transfer out'
  }
} as const

const MemberTransferRequestForm = ({
  currentAssociationCode,
  mode,
  members,
  receivingAssociationCode
}: {
  currentAssociationCode: string
  mode: TransferMode
  members: MemberTransferMemberOption[]
  receivingAssociationCode?: string
}) => {
  const copy = transferFormCopy[mode]
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

  const displayReceivingAssociationCode =
    mode === 'outgoing' ? targetAssociationCode.trim().toUpperCase() : (receivingAssociationCode ?? currentAssociationCode)

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
            <CardTitle className='text-lg break-words'>{copy.title}</CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>
              {copy.associationHelp}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4'>
        <FormContainer action={copy.action} className='grid gap-3'>
          <input type='hidden' name='memberId' value={selectedMemberId} />
          <div className='grid gap-1.5'>
            <Label htmlFor={`member-transfer-${mode}-search`}>{copy.searchLabel}</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id={`member-transfer-${mode}-search`}
                type='search'
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className='pl-9'
              />
            </div>
          </div>

          {mode === 'outgoing' ? (
            <div className='grid gap-1.5'>
              <Label htmlFor='member-transfer-receiving-association-code'>Receiving association code</Label>
              <Input
                id='member-transfer-receiving-association-code'
                name='receivingAssociationCode'
                value={targetAssociationCode}
                onChange={event => setTargetAssociationCode(event.target.value.toUpperCase())}
                placeholder='ABCD'
                maxLength={4}
                autoCapitalize='characters'
                className='font-extrabold tracking-wide uppercase'
                required
              />
            </div>
          ) : null}

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-semibold'>{copy.selectLabel}</p>
              <p className='text-muted-foreground text-xs'>
                {filteredMembers.length} match{filteredMembers.length === 1 ? '' : 'es'}
              </p>
            </div>
            {filteredMembers.length === 0 ? (
              <p className='text-muted-foreground rounded-md border bg-muted/30 p-3 text-sm'>
                {copy.noMatches}
              </p>
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
                        'grid min-w-0 gap-1 rounded-md border bg-background/70 p-3 text-left text-sm transition-colors hover:border-primary/60 hover:bg-muted/40',
                        isSelected && 'border-primary bg-primary/10'
                      )}
                    >
                      <span className='font-extrabold break-words'>
                        {member.firstName} {member.lastAndMiddleNames}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        Matriculation: {member.memberMatriculationNumber} · Current association: {member.associationCode}
                      </span>
                      <span className='text-primary text-xs font-semibold'>
                        Status: {formatMemberStatus(member.memberStatus)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            {hiddenMatchCount > 0 ? (
              <p className='text-muted-foreground text-xs'>
                Showing first {maxVisibleMembers} matches. Keep typing to narrow the search.
              </p>
            ) : null}
          </div>

          <div className='grid gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-2'>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Selected member</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastAndMiddleNames}` : 'Select a member'}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{copy.memberAssociationLabel}</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? selectedMember.associationCode : 'N/A'}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>{copy.receivingAssociationLabel}</p>
              <p className='mt-1 font-extrabold break-words'>{displayReceivingAssociationCode || 'Enter code'}</p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Member status</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? formatMemberStatus(selectedMember.memberStatus) : 'N/A'}
              </p>
            </div>
          </div>

          <SubmitButton text={copy.submitText} className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default MemberTransferRequestForm
