'use client'

import { useMemo, useState } from 'react'

import { Search, UserRound } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitNameChangeRequestAction } from '@/utils/actions'

type NameChangeMemberOption = {
  associationCode: string
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
}

const maxVisibleMembers = 10

const getMemberSearchValue = (member: NameChangeMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.associationCode}`.toLowerCase()

const NameChangeProposalForm = ({ members }: { members: NameChangeMemberOption[] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) return members

    return members.filter(member => getMemberSearchValue(member).includes(normalizedSearch))
  }, [members, searchQuery])

  const displayedMembers = filteredMembers.slice(0, maxVisibleMembers)
  const hiddenMatchCount = filteredMembers.length - displayedMembers.length

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)

    const selectedMemberStillMatches =
      selectedMember && getMemberSearchValue(selectedMember).includes(nextSearchQuery.trim().toLowerCase())

    if (!selectedMemberStillMatches) {
      setSelectedMemberId('')
    }
  }

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='border-b px-4 py-4'>
        <div className='flex items-start gap-3'>
          <UserRound className='text-primary mt-1 size-5 shrink-0' />
          <div className='min-w-0'>
            <CardTitle className='text-lg break-words'>Propose a name change</CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>
              Choose the member, enter the corrected name, and submit it for admin review.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4'>
        <FormContainer action={submitNameChangeRequestAction} className='grid gap-3' refreshOnMessage>
          <input type='hidden' name='memberId' value={selectedMemberId} />
          <div className='grid gap-1.5'>
            <Label htmlFor='name-change-search'>Search members</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id='name-change-search'
                type='search'
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder='Search by name, matriculation, or association code'
                className='pl-9'
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-semibold'>Select member</p>
              <p className='text-muted-foreground text-xs'>
                {filteredMembers.length} match{filteredMembers.length === 1 ? '' : 'es'}
              </p>
            </div>
            {filteredMembers.length === 0 ? (
              <p className='text-muted-foreground rounded-md border bg-muted/30 p-3 text-sm'>
                No members match your search.
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
                        Matriculation: {member.memberMatriculationNumber} · Association: {member.associationCode}
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
              <p className='text-muted-foreground text-xs font-semibold'>Current first name</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? selectedMember.firstName : 'Select a member'}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Current last and middle names</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? selectedMember.lastAndMiddleNames : 'Select a member'}
              </p>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='grid gap-1.5'>
              <Label htmlFor='requested-first-name'>Proposed first name</Label>
              <Input id='requested-first-name' name='requestedFirstName' required />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='requested-last-name'>Proposed last and middle names</Label>
              <Input id='requested-last-name' name='requestedLastAndMiddleNames' required />
            </div>
          </div>

          <SubmitButton text='Submit for admin review' className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default NameChangeProposalForm
